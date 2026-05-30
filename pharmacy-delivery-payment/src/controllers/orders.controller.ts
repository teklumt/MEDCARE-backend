import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Order from '../models/Order';
import Medication from '../models/Medication';
import Pharmacy from '../models/Pharmacy';
import Payment from '../models/Payment';
import User from '../models/User';
import DeliveryAgent from '../models/DeliveryAgent';
import PrescriptionUpload from '../models/PrescriptionUpload';
import { AuthRequest } from '../middleware/auth';
import { ORDER_STATUS_TRANSITIONS } from '../config/constants';
import { chapaService } from '../services/chapa.service';
import { ensurePharmacyDriverConversation } from '../services/pharmacyDriverConversation';
import { IOrderStatusHistory } from '../types';
import { parseCoordinatesInput } from '../utils/geo';
import { recordCommissionAccrualIfEligible } from '../services/commission.service';
import {
  emitNewOrderPendingForPharmacyOwner,
  emitOrderStatusChangeNotifications,
  emitPatientCancelledPendingOrder,
  emitPatientConfirmedReceipt
} from '../services/notification.service';

function buildDeliveryAddress(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const a = raw as Record<string, unknown>;
  const coords = parseCoordinatesInput(a.coordinates);
  const base: Record<string, unknown> = {};
  if (typeof a.recipientName === 'string') base.recipientName = a.recipientName.trim();
  if (typeof a.phone === 'string') base.phone = a.phone.trim();
  if (typeof a.street === 'string') base.street = a.street.trim();
  if (typeof a.subCity === 'string') base.subCity = a.subCity.trim();
  if (typeof a.city === 'string') base.city = a.city.trim();
  if (typeof a.additionalInfo === 'string') base.additionalInfo = a.additionalInfo.trim();
  if (coords) base.coordinates = coords;
  return base;
}

const buildStatusEntry = (status: string, actorId?: Types.ObjectId, note?: string): IOrderStatusHistory => ({
  status,
  actorId,
  note: note || null,
  createdAt: new Date()
});

const generateTxRef = (orderRef: string) => `medcare-${orderRef}-${Date.now()}`;
const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const resolveChapaEmail = (candidate: string): string => {
  const cleaned = String(candidate || '').trim().toLowerCase();
  if (isValidEmail(cleaned)) return cleaned;
  // Fallback is mainly for test mode to avoid blocking checkout due to bad profile email.
  return String(process.env.CHAPA_FALLBACK_EMAIL || 'abebech_bekele@gmail.com').trim().toLowerCase();
};

type OrderLeanForAccess = {
  patientId?: unknown;
  pharmacyId?: unknown;
  deliveryAgentId?: unknown | null;
};

const userCanAccessOrder = async (
  order: OrderLeanForAccess,
  user: NonNullable<AuthRequest['user']>
): Promise<boolean> => {
  const uid = user.userId;
  if (user.role === 'admin') return true;
  if (user.role === 'patient') return String(order.patientId) === uid;
  if (user.role === 'delivery') {
    return order.deliveryAgentId != null && String(order.deliveryAgentId) === uid;
  }
  if (user.role === 'pharmacy') {
    const pharmacy = await Pharmacy.findOne({ ownerId: uid }).lean();
    return !!pharmacy && String(order.pharmacyId) === String(pharmacy._id);
  }
  return false;
};

/** Creates Payment row and updates order payment fields (Chapa init when applicable). */
export const attachPaymentToOrder = async (
  orderDoc: InstanceType<typeof Order>
): Promise<{ payment: InstanceType<typeof Payment>; checkoutUrl?: string }> => {
  const patientUserId = String(orderDoc.patientId);
  const totalAmount = orderDoc.totalAmount;
  const paymentMethod = orderDoc.paymentMethod;
  const txRef = generateTxRef(orderDoc.ref || String(orderDoc._id));

  let checkoutUrl: string | undefined;

  if (paymentMethod === 'chapa') {
    const user = await User.findById(patientUserId).lean();
    if (!user) {
      throw new Error('User not found');
    }
    let email = resolveChapaEmail(String(user.email || ''));

    const userName = user.username || 'Customer';
    const nameParts = userName.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    let chapaResponse;
    try {
      chapaResponse = await chapaService.initializePayment({
        amount: totalAmount,
        currency: 'ETB',
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: user.phone,
        tx_ref: txRef,
        callback_url:
          process.env.CHAPA_CALLBACK_URL ||
          `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/chapa/webhook`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?order_id=${orderDoc._id}`,
        customization: {
          title: 'MedCare Ethiopia',
          description: `Order ${orderDoc.ref || orderDoc._id} - Medication Purchase`,
          logo: undefined
        }
      });
    } catch (initError) {
      const initMessage = (initError as Error)?.message || '';
      const fallbackEmail = resolveChapaEmail('');
      const shouldRetryWithFallback = initMessage.includes('validation.email') && email !== fallbackEmail;

      if (!shouldRetryWithFallback) {
        throw initError;
      }

      email = fallbackEmail;
      chapaResponse = await chapaService.initializePayment({
        amount: totalAmount,
        currency: 'ETB',
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: user.phone,
        tx_ref: txRef,
        callback_url:
          process.env.CHAPA_CALLBACK_URL ||
          `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/chapa/webhook`,
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?order_id=${orderDoc._id}`,
        customization: {
          title: 'MedCare Ethiopia',
          description: `Order ${orderDoc.ref || orderDoc._id} - Medication Purchase`,
          logo: undefined
        }
      });
    }

    checkoutUrl = chapaResponse.data.checkout_url;
    console.log('✅ Chapa payment initialized:', { txRef, checkoutUrl });
  }

  const payment = await Payment.create({
    orderId: orderDoc._id,
    patientId: patientUserId,
    txRef,
    checkoutUrl,
    amount: totalAmount,
    currency: 'ETB',
    paymentMethod,
    status: paymentMethod === 'cod' ? 'cod_pending' : 'initiated',
    mode: process.env.CHAPA_MODE || 'test'
  });

  orderDoc.paymentId = payment._id as mongoose.Types.ObjectId;
  orderDoc.paymentStatus = paymentMethod === 'cod' ? 'cod_pending' : 'initiated';
  await orderDoc.save();

  return { payment, checkoutUrl };
};

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const {
      pharmacyId,
      deliveryMethod,
      deliveryAddress,
      deliveryInstructions,
      items,
      paymentMethod,
      deliveryFee = 0,
      discount = 0,
      prescriptionUploadId,
      deferRxReview: deferRxReviewRaw
    } = req.body;
    const deferRxReview = Boolean(deferRxReviewRaw);

    if (!pharmacyId || !deliveryMethod || !paymentMethod || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, error: 'Missing required fields' });
      return;
    }

    const pharmacy = await Pharmacy.findById(pharmacyId).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    const medicationIds = items.map((item: any) => item.medicationId).filter(Boolean);
    const medications = await Medication.find({ _id: { $in: medicationIds }, isActive: true }).lean();

    const medicationMap = new Map(medications.map((m) => [String(m._id), m]));

    const orderItems = items.map((item: any) => {
      const med = medicationMap.get(String(item.medicationId));
      if (!med) throw new Error('Medication not found');
      const quantity = Number(item.quantity || 0);
      const unitPrice = med.price;
      const subtotal = unitPrice * quantity;

      return {
        medicationId: med._id,
        medicationName: med.name,
        genericName: med.genericName,
        quantity,
        unitPrice,
        subtotal,
        requiresPrescription: med.requiresPrescription
      };
    });

    const subtotal = orderItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);
    const totalAmount = subtotal + Number(deliveryFee || 0) - Number(discount || 0);

    const anyRxItem = orderItems.some((item: any) => item.requiresPrescription);
    const uploadIdRaw = prescriptionUploadId;
    const hasUploadId =
      uploadIdRaw != null &&
      uploadIdRaw !== '' &&
      mongoose.Types.ObjectId.isValid(String(uploadIdRaw));

    if (anyRxItem && !hasUploadId) {
      res.status(400).json({
        success: false,
        error: 'Prescription upload required for prescription medications'
      });
      return;
    }

    if (deferRxReview && (!hasUploadId || !anyRxItem)) {
      res.status(400).json({
        success: false,
        error: 'deferRxReview requires prescription upload and prescription-required items'
      });
      return;
    }

    if (anyRxItem && hasUploadId && !deferRxReview) {
      res.status(400).json({
        success: false,
        error:
          'deferRxReview must be true when ordering prescription medications with an uploaded prescription'
      });
      return;
    }

    let validatedUploadId: mongoose.Types.ObjectId | null = null;
    if (hasUploadId) {
      const rxUpload = await PrescriptionUpload.findOne({
        _id: uploadIdRaw,
        patientId: req.user.userId
      }).lean();
      if (!rxUpload) {
        res.status(400).json({
          success: false,
          error: 'Prescription upload not found or access denied'
        });
        return;
      }
      validatedUploadId = new mongoose.Types.ObjectId(String(uploadIdRaw));
    }

    const useDeferPaymentPath = deferRxReview && anyRxItem && hasUploadId;

    let normalizedDeliveryAddress: Record<string, unknown> | undefined;
    if (deliveryMethod === 'delivery') {
      normalizedDeliveryAddress = buildDeliveryAddress(deliveryAddress);
      if (!normalizedDeliveryAddress?.coordinates) {
        res.status(400).json({
          success: false,
          error: 'Delivery orders require a valid delivery map pin (coordinates)'
        });
        return;
      }
    }

    const order = await Order.create({
      patientId: req.user.userId,
      pharmacyId,
      deliveryMethod,
      deliveryAddress: normalizedDeliveryAddress,
      deliveryInstructions,
      prescriptionUploadId: validatedUploadId,
      prescriptionVerified: false,
      status: 'pending',
      paymentMethod,
      paymentStatus: useDeferPaymentPath
        ? 'pending_prescription_review'
        : paymentMethod === 'cod'
          ? 'cod_pending'
          : 'initiated',
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      statusHistory: [buildStatusEntry('pending', new Types.ObjectId(req.user.userId))]
    });

    if (useDeferPaymentPath && validatedUploadId) {
      await PrescriptionUpload.findByIdAndUpdate(validatedUploadId, { orderId: order._id });
      await emitNewOrderPendingForPharmacyOwner(order);
      res.status(201).json({
        success: true,
        message: 'Order submitted for prescription review',
        data: { order, payment: null }
      });
      return;
    }

    try {
      const { payment } = await attachPaymentToOrder(order);
      await emitNewOrderPendingForPharmacyOwner(order);
      res.status(201).json({
        success: true,
        message: 'Order created',
        data: { order, payment }
      });
    } catch (attachErr) {
      await Order.findByIdAndDelete(order._id);
      throw attachErr;
    }
  } catch (error) {
    const message = (error as Error).message || 'Unknown error';
    const shouldReturnBadRequest =
      message.includes('CHAPA_SECRET_KEY') ||
      message.includes('validation.') ||
      message.includes('User not found');
    res.status(shouldReturnBadRequest ? 400 : 500).json({ success: false, error: 'Failed to create order', details: message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const status = typeof req.query.status === 'string' ? req.query.status : null;

    const query: Record<string, any> = { patientId: req.user.userId };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders', details: (error as Error).message });
  }
};

export const getPharmacyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const status = typeof req.query.status === 'string' ? req.query.status : null;
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId }).lean();

    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    const query: Record<string, any> = { pharmacyId: pharmacy._id };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch pharmacy orders', details: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('pharmacyId', 'businessName address location coordinates phone')
      .lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (!(await userCanAccessOrder(order, req.user))) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch order', details: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const { status, note, deliveryAgentId } = req.body as {
      status?: string;
      note?: string;
      deliveryAgentId?: string;
    };

    if (!status || typeof status !== 'string') {
      res.status(400).json({ success: false, error: 'status is required' });
      return;
    }

    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId });
    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (String(order.pharmacyId) !== String(pharmacy._id)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status transition' });
      return;
    }

    const prevStatus = order.status;

    if (
      status === 'delivered' &&
      order.deliveryMethod === 'delivery' &&
      order.deliveryAgentId != null
    ) {
      res.status(400).json({
        success: false,
        error: 'Home delivery with an assigned agent is marked delivered when the patient confirms receipt'
      });
      return;
    }

    if (status === 'dispatched' && order.deliveryMethod === 'delivery') {
      if (!deliveryAgentId || typeof deliveryAgentId !== 'string') {
        res.status(400).json({ success: false, error: 'deliveryAgentId is required for delivery orders' });
        return;
      }
      if (!mongoose.Types.ObjectId.isValid(deliveryAgentId)) {
        res.status(400).json({ success: false, error: 'Invalid deliveryAgentId' });
        return;
      }
      const agentDoc = await DeliveryAgent.findOne({
        _id: new mongoose.Types.ObjectId(deliveryAgentId),
        pharmacyId: pharmacy._id
      }).lean();
      if (!agentDoc) {
        res.status(400).json({ success: false, error: 'Delivery agent not found or not employed by this pharmacy' });
        return;
      }
      order.set('deliveryAgentId', new Types.ObjectId(deliveryAgentId));
    }

    order.status = status;
    order.statusHistory.push(buildStatusEntry(status, new Types.ObjectId(req.user.userId), note));
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    if (order.status === 'delivered') {
      await recordCommissionAccrualIfEligible(order);
    }

    if (order.status === 'dispatched' && order.deliveryMethod === 'delivery' && order.deliveryAgentId) {
      await ensurePharmacyDriverConversation(order._id);
    }

    if (status !== prevStatus && status !== 'preparing' && status !== 'ready') {
      await emitOrderStatusChangeNotifications(order.toObject());
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order status', details: (error as Error).message });
  }
};

export const getOrderTracking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('pharmacyId', 'businessName address location coordinates')
      .select(
        'status statusHistory patientId pharmacyId deliveryAgentId tripStartedAt driverHandoffAt deliveryAddress driverLocation deliveryMethod'
      )
      .lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (!(await userCanAccessOrder(order, req.user))) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const pharmacy =
      order.pharmacyId && typeof order.pharmacyId === 'object'
        ? {
            _id: (order.pharmacyId as { _id?: unknown })._id,
            businessName: (order.pharmacyId as { businessName?: string }).businessName,
            address: (order.pharmacyId as { address?: string }).address,
            location: (order.pharmacyId as { location?: string }).location,
            coordinates: (order.pharmacyId as { coordinates?: unknown }).coordinates
          }
        : null;

    const liveTrip =
      order.deliveryMethod === 'delivery' &&
      order.tripStartedAt &&
      !order.driverHandoffAt;

    res.json({
      success: true,
      data: {
        status: order.status,
        statusHistory: order.statusHistory,
        tripStartedAt: order.tripStartedAt ?? null,
        driverHandoffAt: order.driverHandoffAt ?? null,
        deliveryAddress: order.deliveryAddress ?? null,
        pharmacy,
        driverLocation: liveTrip ? order.driverLocation ?? null : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tracking', details: (error as Error).message });
  }
};

export const confirmPatientReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid order id' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (String(order.patientId) !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (order.deliveryMethod !== 'delivery') {
      res.status(400).json({ success: false, error: 'Confirmation applies to home delivery orders only' });
      return;
    }

    if (!order.deliveryAgentId) {
      res.status(400).json({ success: false, error: 'No delivery agent assigned to this order' });
      return;
    }

    if (order.status !== 'dispatched') {
      res.status(400).json({ success: false, error: 'Order cannot be confirmed in its current status' });
      return;
    }

    if (!order.driverHandoffAt) {
      res.status(400).json({
        success: false,
        error: 'Delivery must confirm handoff before you can mark the order received'
      });
      return;
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes('delivered')) {
      res.status(400).json({ success: false, error: 'Invalid status transition' });
      return;
    }

    const patientOid = new Types.ObjectId(req.user.userId);
    order.status = 'delivered';
    order.deliveredAt = new Date();
    order.statusHistory.push(buildStatusEntry('delivered', patientOid, 'patient_confirmed_receipt'));
    await order.save();

    await recordCommissionAccrualIfEligible(order);

    await emitPatientConfirmedReceipt(order.toObject());

    res.json({ success: true, message: 'Delivery confirmed', data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to confirm receipt',
      details: (error as Error).message
    });
  }
};

export const completeOrderPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid order id' });
      return;
    }

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (String(order.patientId) !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (order.status === 'cancelled' || order.status === 'rejected') {
      res.status(400).json({ success: false, error: 'Order cannot accept payment' });
      return;
    }

    if (order.paymentStatus !== 'pending_prescription_review') {
      res.status(400).json({
        success: false,
        error: 'Order is not awaiting payment after prescription review'
      });
      return;
    }

    if (order.prescriptionUploadId && !order.prescriptionVerified) {
      res.status(400).json({ success: false, error: 'Prescription must be verified before payment' });
      return;
    }

    if (order.paymentId) {
      res.status(400).json({ success: false, error: 'Payment already initiated' });
      return;
    }

    try {
      const { payment, checkoutUrl } = await attachPaymentToOrder(order);
      const updatedOrder = await Order.findById(order._id).lean();
      res.status(200).json({
        success: true,
        message: 'Payment initiated',
        data: {
          order: updatedOrder,
          payment,
          checkoutUrl: checkoutUrl ?? payment.checkoutUrl
        }
      });
    } catch (attachErr) {
      const message = (attachErr as Error)?.message || 'Failed to initialize payment';
      const shouldReturnBadRequest =
        message.includes('CHAPA_SECRET_KEY') ||
        message.includes('validation.') ||
        message.includes('User not found');
      res.status(shouldReturnBadRequest ? 400 : 500).json({
        success: false,
        error: 'Failed to complete payment',
        details: message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to complete payment',
      details: (error as Error).message
    });
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    if (order.status !== 'pending') {
      res.status(400).json({ success: false, error: 'Only pending orders can be cancelled' });
      return;
    }

    order.status = 'cancelled';
    order.statusHistory.push(buildStatusEntry('cancelled', new Types.ObjectId(req.user.userId)));
    await order.save();

    await emitPatientCancelledPendingOrder(order.toObject());

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to cancel order', details: (error as Error).message });
  }
};
