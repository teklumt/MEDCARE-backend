import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Order from '../models/Order';
import Medication from '../models/Medication';
import Pharmacy from '../models/Pharmacy';
import Payment from '../models/Payment';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ORDER_STATUS_TRANSITIONS } from '../config/constants';
import { chapaService } from '../services/chapa.service';
import { IOrderStatusHistory } from '../types';

const buildStatusEntry = (status: string, actorId?: Types.ObjectId, note?: string): IOrderStatusHistory => ({
  status,
  actorId,
  note: note || null,
  createdAt: new Date()
});

const generateTxRef = (orderRef: string) => `medcare-${orderRef}-${Date.now()}`;

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
      prescriptionUploadId
    } = req.body;

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

    const order = await Order.create({
      patientId: req.user.userId,
      pharmacyId,
      deliveryMethod,
      deliveryAddress,
      deliveryInstructions,
      prescriptionUploadId: prescriptionUploadId || null,
      prescriptionVerified: false,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'cod_pending' : 'initiated',
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      statusHistory: [buildStatusEntry('pending', new Types.ObjectId(req.user.userId))]
    });

    const txRef = generateTxRef(order.ref || String(order._id));

    let checkoutUrl: string | undefined;

    // If payment method is Chapa, initialize payment with Chapa API
    if (paymentMethod === 'chapa') {
      try {
        // Get user details for Chapa
        const user = await User.findById(req.user.userId).lean();
        if (!user) {
          throw new Error('User not found');
        }

        // Get user's name - use username if no other name available
        const userName = user.username || 'Customer';
        const nameParts = userName.split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        // Initialize payment with Chapa
        const chapaResponse = await chapaService.initializePayment({
          amount: totalAmount,
          currency: 'ETB',
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          phone_number: user.phone,
          tx_ref: txRef,
          callback_url: process.env.CHAPA_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/chapa/webhook`,
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback?order_id=${order._id}`,
          customization: {
            title: 'MedCare Ethiopia',
            description: `Order ${order.ref || order._id} - Medication Purchase`,
            logo: undefined
          }
        });

        checkoutUrl = chapaResponse.data.checkout_url;
        console.log('✅ Chapa payment initialized:', { txRef, checkoutUrl });
      } catch (error) {
        console.error('❌ Chapa initialization failed:', error);
        // Fall back to manual payment or throw error
        throw new Error('Failed to initialize payment. Please try again.');
      }
    }

    const payment = await Payment.create({
      orderId: order._id,
      patientId: req.user.userId,
      txRef,
      checkoutUrl,
      amount: totalAmount,
      currency: 'ETB',
      paymentMethod,
      status: paymentMethod === 'cod' ? 'cod_pending' : 'initiated',
      mode: process.env.CHAPA_MODE || 'test'
    });

    order.paymentId = payment._id as mongoose.Types.ObjectId;
    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created',
      data: { order, payment }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create order', details: (error as Error).message });
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
    const order = await Order.findById(id).lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
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
    const { status, note } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    const allowed = ORDER_STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(status)) {
      res.status(400).json({ success: false, error: 'Invalid status transition' });
      return;
    }

    order.status = status;
    order.statusHistory.push(buildStatusEntry(status, new Types.ObjectId(req.user.userId), note));
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update order status', details: (error as Error).message });
  }
};

export const getOrderTracking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).select('status statusHistory').lean();

    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tracking', details: (error as Error).message });
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

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to cancel order', details: (error as Error).message });
  }
};
