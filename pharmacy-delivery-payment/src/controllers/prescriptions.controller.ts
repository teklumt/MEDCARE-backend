import { Response } from 'express';
import PrescriptionUpload from '../models/PrescriptionUpload';
import Pharmacy from '../models/Pharmacy';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl } from '../config/upload';

export const uploadPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Check if file was uploaded via multer
    if (req.file) {
      const { orderId } = req.body;
      
      // Get file URL (works for both Cloudinary and local storage)
      const fileUrl = getFileUrl(req.file);
      const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';

      const upload = await PrescriptionUpload.create({
        patientId: req.user.userId,
        orderId: orderId || null,
        fileUrl,
        fileType,
        uploadedAt: new Date()
      });

      res.status(201).json({ 
        success: true, 
        message: 'Prescription uploaded successfully', 
        data: upload 
      });
      return;
    }

    // Fallback: Accept fileUrl directly (for pre-uploaded files)
    const { fileUrl, fileType, orderId } = req.body;

    if (!fileUrl || !fileType) {
      res.status(400).json({ 
        success: false, 
        error: 'Please upload a file or provide fileUrl and fileType' 
      });
      return;
    }

    const upload = await PrescriptionUpload.create({
      patientId: req.user.userId,
      orderId,
      fileUrl,
      fileType,
      uploadedAt: new Date()
    });

    res.status(201).json({ 
      success: true, 
      message: 'Prescription uploaded successfully', 
      data: upload 
    });
  } catch (error) {
    console.error('Prescription upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload prescription', 
      details: (error as Error).message 
    });
  }
};

type WebhookScanBody = {
  success?: boolean;
  medicines?: unknown;
  medicine_count?: unknown;
  parsed_prescription?: unknown;
  error?: string;
};

export const scanPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const webhookUrl = process.env.PRESCRIPTION_SCAN_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      res.status(503).json({ success: false, error: 'Prescription scan service is not configured.' });
      return;
    }

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    if (!req.file?.buffer) {
      res.status(400).json({ success: false, error: 'Please upload a prescription image or PDF.' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'No token provided.' });
      return;
    }

    const patientToken = authHeader.substring(7);
    const formData = new FormData();
    const bytes = new Uint8Array(req.file.buffer);
    const blob = new Blob([bytes], { type: req.file.mimetype || 'application/octet-stream' });
    formData.append('prescription_image', blob, req.file.originalname || 'prescription');
    formData.append('user_id', req.user.userId);
    formData.append('patient_token', patientToken);

    let whResponse: globalThis.Response;
    try {
      whResponse = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(90_000)
      });
    } catch (err) {
      const name = (err as Error).name;
      if (name === 'TimeoutError' || name === 'AbortError') {
        res.status(504).json({ success: false, error: 'Prescription scan timed out. Try a smaller file.' });
        return;
      }
      throw err;
    }

    const text = await whResponse.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      res.status(502).json({ success: false, error: 'Prescription scan service returned invalid data.' });
      return;
    }

    const body = json as WebhookScanBody | null;
    const errMsg =
      typeof body?.error === 'string' ? body.error : 'Prescription scan failed. Please try again.';

    if (!whResponse.ok) {
      res.status(502).json({
        success: false,
        error: body && typeof body === 'object' && body.error ? errMsg : 'Prescription scan request failed.'
      });
      return;
    }

    if (body?.success === false) {
      res.status(400).json({ success: false, error: errMsg });
      return;
    }

    const medicines = Array.isArray(body?.medicines)
      ? (body!.medicines as unknown[]).filter((x): x is string => typeof x === 'string')
      : [];
    let medicine_count = typeof body?.medicine_count === 'number' ? body.medicine_count : medicines.length;
    if (medicine_count < medicines.length) medicine_count = medicines.length;

    res.json({
      success: true,
      data: {
        medicines,
        medicine_count,
        parsed_prescription: body?.parsed_prescription ?? null
      }
    });
  } catch (error) {
    console.error('Prescription scan error:', error);
    res.status(500).json({ success: false, error: 'Prescription scan failed.' });
  }
};

export const getPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const upload = await PrescriptionUpload.findById(id).lean();

    if (!upload) {
      res.status(404).json({ success: false, error: 'Prescription not found' });
      return;
    }

    const uid = req.user.userId;

    if (req.user.role === 'admin') {
      res.json({ success: true, data: upload });
      return;
    }

    if (String(upload.patientId) === uid) {
      res.json({ success: true, data: upload });
      return;
    }

    if (req.user.role === 'pharmacy') {
      const pharmacy = await Pharmacy.findOne({ ownerId: uid }).lean();
      if (!pharmacy) {
        res.status(403).json({ success: false, error: 'Forbidden' });
        return;
      }
      const linkedOrder =
        upload.orderId != null
          ? await Order.findById(upload.orderId).lean()
          : await Order.findOne({ prescriptionUploadId: upload._id }).lean();
      if (linkedOrder && String(linkedOrder.pharmacyId) === String(pharmacy._id)) {
        res.json({ success: true, data: upload });
        return;
      }
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    res.status(403).json({ success: false, error: 'Forbidden' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch prescription', details: (error as Error).message });
  }
};
