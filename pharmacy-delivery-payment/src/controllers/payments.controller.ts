import { Response } from 'express';
import crypto from 'crypto';
import Payment from '../models/Payment';
import Order from '../models/Order';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { chapaService } from '../services/chapa.service';

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const resolveChapaEmail = (candidate: string): string => {
  const cleaned = String(candidate || '').trim().toLowerCase();
  if (isValidEmail(cleaned)) return cleaned;
  return String(process.env.CHAPA_FALLBACK_EMAIL || 'abebech_bekele@gmail.com').trim().toLowerCase();
};

const verifySignature = (payload: string, signature?: string) => {
  const secret = process.env.CHAPA_WEBHOOK_SECRET;
  if (!secret || !signature) return true;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return hmac === signature;
};

export const initiateChapaPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      res.status(400).json({ success: false, error: 'orderId is required' });
      return;
    }

    const order = await Order.findById(orderId).lean();
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const payment = await Payment.findOne({ orderId: order._id });
    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found' });
      return;
    }

    let checkoutUrl = payment.checkoutUrl;

    if (!checkoutUrl && order.paymentMethod === 'chapa') {
      const user = await User.findById(order.patientId).lean();
      if (!user) {
        res.status(400).json({ success: false, error: 'Patient profile not found for checkout' });
        return;
      }

      let email = resolveChapaEmail(String(user.email || ''));
      const userName = user.username || 'Customer';
      const nameParts = userName.split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      let chapaResponse;
      try {
        chapaResponse = await chapaService.initializePayment({
          amount: order.totalAmount,
          currency: 'ETB',
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: user.phone,
          tx_ref: payment.txRef,
          callback_url:
            process.env.CHAPA_CALLBACK_URL ||
            `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/chapa/webhook`,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?order_id=${order._id}`,
          customization: {
            title: 'MedCare Ethiopia',
            description: `Order ${order.ref || order._id} - Medication Purchase`,
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
          amount: order.totalAmount,
          currency: 'ETB',
          email,
          first_name: firstName,
          last_name: lastName,
          phone_number: user.phone,
          tx_ref: payment.txRef,
          callback_url:
            process.env.CHAPA_CALLBACK_URL ||
            `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/chapa/webhook`,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?order_id=${order._id}`,
          customization: {
            title: 'MedCare Ethiopia',
            description: `Order ${order.ref || order._id} - Medication Purchase`,
            logo: undefined
          }
        });
      }

      checkoutUrl = chapaResponse.data.checkout_url;
      payment.checkoutUrl = checkoutUrl;
      await payment.save();
    }

    res.json({
      success: true,
      data: {
        checkoutUrl,
        txRef: payment.txRef
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to initiate payment', details: (error as Error).message });
  }
};

export const chapaWebhook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-chapa-signature'] as string | undefined;
    const rawPayload = JSON.stringify(req.body || {});

    if (!verifySignature(rawPayload, signature)) {
      res.status(401).json({ success: false, error: 'Invalid signature' });
      return;
    }

    const { tx_ref, status, reference, payment_method, mode } = req.body || {};

    const payment = await Payment.findOne({ txRef: tx_ref });
    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found' });
      return;
    }

    payment.status = status || payment.status;
    payment.chapaReference = reference || payment.chapaReference;
    payment.chapaStatus = status || payment.chapaStatus;
    payment.mode = mode || payment.mode;
    payment.webhookReceivedAt = new Date();
    payment.webhookPayload = req.body;
    payment.verifiedAt = new Date();
    payment.paymentMethod = payment_method || payment.paymentMethod;

    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: payment.status,
      paymentMethod: payment.paymentMethod
    });

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to process webhook', details: (error as Error).message });
  }
};

export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).lean();

    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found' });
      return;
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payment', details: (error as Error).message });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found' });
      return;
    }

    // Verify with Chapa API
    try {
      const chapaVerification = await chapaService.verifyPayment(payment.txRef);
      
      console.log('✅ Chapa verification response:', chapaVerification);

      // Update payment with Chapa verification data
      payment.chapaReference = chapaVerification.data.reference;
      payment.chapaStatus = chapaVerification.data.status;
      payment.status = chapaVerification.data.status === 'success' ? 'success' : 'failed';
      payment.verifiedAt = new Date();
      payment.mode = chapaVerification.data.mode;
      payment.paymentMethod = chapaVerification.data.method;
      payment.chapaCharge = parseFloat(chapaVerification.data.charge || '0');

      // Verify amount matches
      const chapaAmount = parseFloat(chapaVerification.data.amount);
      if (Math.abs(chapaAmount - payment.amount) > 0.01) {
        console.warn('⚠️ Amount mismatch:', { expected: payment.amount, received: chapaAmount });
      }

      await payment.save();

      // Update order payment status
      await Order.findByIdAndUpdate(payment.orderId, {
        paymentStatus: payment.status
      });

      res.json({ 
        success: true, 
        message: 'Payment verified with Chapa', 
        data: payment 
      });
    } catch (chapaError: any) {
      console.error('❌ Chapa verification failed:', chapaError.message);
      
      // Still update local verification timestamp
      payment.verifiedAt = new Date();
      if (payment.status === 'initiated') {
        payment.status = 'pending';
      }
      await payment.save();

      res.json({ 
        success: true, 
        message: 'Payment marked as verified locally (Chapa verification failed)', 
        data: payment,
        warning: 'Could not verify with Chapa API'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to verify payment', details: (error as Error).message });
  }
};
