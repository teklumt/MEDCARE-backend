import { Response } from 'express';
import mongoose, { Types } from 'mongoose';
import Order from '../models/Order';
import DeliveryAgent from '../models/DeliveryAgent';
import User from '../models/User';
import Pharmacy from '../models/Pharmacy';
import { AuthRequest } from '../middleware/auth';
import { IOrderStatusHistory } from '../types';
import { DEFAULT_PAGE_LIMIT } from '../config/constants';
import { parseLatLngBody } from '../utils/geo';
import { getDeliveryProfileFileUrl } from '../config/upload';
import { emitDeliveryTripStarted, emitDriverHandoff } from '../services/notification.service';

type DeliveryPeriod = 'today' | 'week' | 'month' | 'all';

function parsePeriod(q: unknown): DeliveryPeriod {
  const p = typeof q === 'string' ? q.trim().toLowerCase() : '';
  if (['today', 'week', 'month', 'all'].includes(p)) return p as DeliveryPeriod;
  return 'all';
}

/** Monday 00:00 local time for the calendar week containing `d`. */
function startOfCalendarWeek(d = new Date()): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  x.setDate(diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfCalendarMonth(d = new Date()): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function periodBounds(period: DeliveryPeriod): { start: Date | null; end: Date } {
  const end = new Date();
  if (period === 'all') return { start: null, end };
  if (period === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
  if (period === 'week') {
    return { start: startOfCalendarWeek(), end };
  }
  return { start: startOfCalendarMonth(), end };
}

/** Terminal/completed for driver history & earnings (excludes active dispatched-without-handoff). */
function completedDeliveryMatch(agentId: Types.ObjectId) {
  return {
    deliveryAgentId: agentId,
    deliveryMethod: 'delivery' as const,
    $or: [
      { driverHandoffAt: { $ne: null } },
      { status: 'delivered' },
      { status: 'cancelled' }
    ]
  };
}

const tripStartedHistoryEntry = (actorId: Types.ObjectId): IOrderStatusHistory => ({
  status: 'dispatched',
  actorId,
  note: 'delivery_trip_started',
  createdAt: new Date()
});

/** Stored Driver vehicle enum → signup form labels */
const STORED_VEHICLE_TO_UI: Record<string, string> = {
  motorcycle: 'Motorcycle',
  bicycle: 'Bicycle',
  on_foot: 'On Foot',
  three_wheeler: 'Three-Wheeler (Bajaj)',
  car: 'Car'
};

function displayNameFromUsername(username: string): string {
  const s = username.replace(/_/g, ' ').trim();
  if (!s) return username;
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Local part after +251 for UI that renders "+251 {phoneNumber}" */
function phoneLocalEt(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 12 && digits.startsWith('251')) {
    return digits.slice(3);
  }
  return phone.replace(/^\+251\s?/, '').replace(/\s/g, '') || phone;
}

export const getMyDeliveryProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    if (req.user.role !== 'delivery') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const uid = req.user.userId;
    const [user, agent] = await Promise.all([
      User.findById(uid).select('username email phone role profilePhotoUrl').lean(),
      DeliveryAgent.findById(uid).lean()
    ]);

    if (!user || user.role !== 'delivery') {
      res.status(404).json({ success: false, error: 'Delivery profile not found' });
      return;
    }

    const pharmacyDoc = agent?.pharmacyId
      ? await Pharmacy.findById(agent.pharmacyId).select('businessName address location').lean()
      : null;

    const vt = typeof agent?.vehicleType === 'string' ? agent.vehicleType : '';
    const vehicleType = (STORED_VEHICLE_TO_UI[vt] ?? vt) || 'Motorcycle';

    res.json({
      success: true,
      data: {
        fullName: displayNameFromUsername(String(user.username || '')),
        email: user.email,
        phoneNumber: phoneLocalEt(String(user.phone || '')),
        nationalId: String(agent?.nationalId ?? ''),
        vehicleType,
        licensePlate: String(agent?.licensePlate ?? ''),
        pharmacyName: String(pharmacyDoc?.businessName ?? ''),
        pharmacyAddress: String(pharmacyDoc?.address || pharmacyDoc?.location || ''),
        profilePhotoUrl: typeof user.profilePhotoUrl === 'string' && user.profilePhotoUrl.trim() !== ''
          ? user.profilePhotoUrl
          : undefined
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load profile',
      details: (error as Error).message
    });
  }
};

export const uploadDeliveryProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'delivery') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, error: 'Image file is required (field name: file).' });
      return;
    }

    const url = getDeliveryProfileFileUrl(req.file);

    await User.findByIdAndUpdate(req.user.userId, { $set: { profilePhotoUrl: url } }).exec();

    res.json({
      success: true,
      data: { profilePhotoUrl: url }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile photo',
      details: (error as Error).message
    });
  }
};

export const deleteDeliveryProfilePhoto = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'delivery') {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    await User.findByIdAndUpdate(req.user.userId, { $unset: { profilePhotoUrl: 1 } }).exec();

    res.json({ success: true, data: { profilePhotoUrl: null } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove profile photo',
      details: (error as Error).message
    });
  }
};

export const getMyAssignedOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const agentId = new Types.ObjectId(req.user.userId);
    const orders = await Order.find({
      deliveryAgentId: agentId,
      status: 'dispatched',
      $or: [{ driverHandoffAt: null }, { driverHandoffAt: { $exists: false } }]
    })
      .populate('pharmacyId', 'businessName address phone location coordinates')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch assignments',
      details: (error as Error).message
    });
  }
};

export const startDeliveryTrip = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!order.deliveryAgentId || String(order.deliveryAgentId) !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (order.status !== 'dispatched') {
      res.status(400).json({ success: false, error: 'Trip can only start for dispatched orders' });
      return;
    }

    if (order.tripStartedAt) {
      res.json({ success: true, message: 'Trip already started', data: order });
      return;
    }

    const actorId = new Types.ObjectId(req.user.userId);
    order.tripStartedAt = new Date();
    order.statusHistory.push(tripStartedHistoryEntry(actorId));
    await order.save();

    await emitDeliveryTripStarted(order.toObject());

    res.json({ success: true, message: 'Trip started', data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to start trip',
      details: (error as Error).message
    });
  }
};

const handoffHistoryEntry = (actorId: Types.ObjectId): IOrderStatusHistory => ({
  status: 'dispatched',
  actorId,
  note: 'delivery_driver_handoff',
  createdAt: new Date()
});

export const confirmDriverHandoff = async (req: AuthRequest, res: Response): Promise<void> => {
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

    if (!order.deliveryAgentId || String(order.deliveryAgentId) !== req.user.userId) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    if (order.deliveryMethod !== 'delivery') {
      res.status(400).json({ success: false, error: 'Handoff applies to home delivery orders only' });
      return;
    }

    if (order.status !== 'dispatched') {
      res.status(400).json({ success: false, error: 'Order must be dispatched' });
      return;
    }

    if (!order.tripStartedAt) {
      res.status(400).json({ success: false, error: 'Accept the delivery before marking handoff' });
      return;
    }

    if (order.driverHandoffAt) {
      res.json({ success: true, message: 'Handoff already recorded', data: order });
      return;
    }

    const actorId = new Types.ObjectId(req.user.userId);
    order.driverHandoffAt = new Date();
    order.statusHistory.push(handoffHistoryEntry(actorId));
    await order.save();

    await emitDriverHandoff(order.toObject());

    res.json({ success: true, message: 'Handoff recorded', data: order });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to record handoff',
      details: (error as Error).message
    });
  }
};

async function agentHasActiveTrip(agentId: Types.ObjectId): Promise<boolean> {
  const active = await Order.findOne({
    deliveryAgentId: agentId,
    status: 'dispatched',
    deliveryMethod: 'delivery',
    tripStartedAt: { $ne: null },
    $or: [{ driverHandoffAt: null }, { driverHandoffAt: { $exists: false } }]
  })
    .select('_id')
    .lean();
  return Boolean(active);
}

export const getMyDeliveryStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const agentId = new Types.ObjectId(req.user.userId);
    const agent = await DeliveryAgent.findById(agentId).select('isOnline').lean();
    if (!agent) {
      res.status(404).json({ success: false, error: 'Delivery agent profile not found' });
      return;
    }

    res.json({
      success: true,
      data: { isOnline: Boolean((agent as { isOnline?: boolean }).isOnline) }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery status',
      details: (error as Error).message
    });
  }
};

export const setMyDeliveryOnlineStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const isOnline = req.body?.isOnline;
    if (typeof isOnline !== 'boolean') {
      res.status(400).json({ success: false, error: 'isOnline (boolean) is required' });
      return;
    }

    const agentId = new Types.ObjectId(req.user.userId);
    const agent = await DeliveryAgent.findById(agentId);
    if (!agent) {
      res.status(404).json({ success: false, error: 'Delivery agent profile not found' });
      return;
    }

    if (!isOnline && (await agentHasActiveTrip(agentId))) {
      res.status(409).json({
        success: false,
        error: 'Cannot go offline while an active delivery trip is in progress'
      });
      return;
    }

    agent.set('isOnline', isOnline);
    await agent.save();

    res.json({
      success: true,
      message: isOnline ? 'You are now online' : 'You are now offline',
      data: { isOnline }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update online status',
      details: (error as Error).message
    });
  }
};

export const updateDriverLocation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const pos = parseLatLngBody(req.body);
    if (!pos) {
      res.status(400).json({ success: false, error: 'Valid lat and lng required' });
      return;
    }

    const agentId = new Types.ObjectId(req.user.userId);
    const order = await Order.findOne({
      deliveryAgentId: agentId,
      status: 'dispatched',
      deliveryMethod: 'delivery',
      tripStartedAt: { $ne: null },
      $or: [{ driverHandoffAt: null }, { driverHandoffAt: { $exists: false } }]
    }).sort({ tripStartedAt: -1 });

    if (!order) {
      res.status(404).json({ success: false, error: 'No active trip to update' });
      return;
    }

    order.set('driverLocation', {
      lat: pos.lat,
      lng: pos.lng,
      updatedAt: new Date()
    });
    await order.save();

    res.json({
      success: true,
      data: {
        orderId: order._id,
        driverLocation: order.driverLocation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update location',
      details: (error as Error).message
    });
  }
};

export const getMyDeliveryHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const agentId = new Types.ObjectId(req.user.userId);
    const period = parsePeriod(req.query.period);
    const { start, end } = periodBounds(period);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || DEFAULT_PAGE_LIMIT)
    );
    const skip = (page - 1) * limit;

    const baseStages: mongoose.PipelineStage[] = [
      { $match: completedDeliveryMatch(agentId) },
      {
        $addFields: {
          completionAt: {
            $ifNull: ['$driverHandoffAt', { $ifNull: ['$deliveredAt', '$updatedAt'] }]
          }
        }
      }
    ];

    if (start) {
      baseStages.push({
        $match: { completionAt: { $gte: start, $lte: end } }
      });
    }

    const dataPipeline: mongoose.PipelineStage[] = [
      ...baseStages,
      { $sort: { completionAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'pharmacies',
          localField: 'pharmacyId',
          foreignField: '_id',
          as: '_ph'
        }
      },
      {
        $addFields: {
          pharmacyId: {
            $let: {
              vars: { p: { $arrayElemAt: ['$_ph', 0] } },
              in: {
                _id: '$$p._id',
                businessName: '$$p.businessName',
                address: '$$p.address'
              }
            }
          }
        }
      },
      { $project: { _ph: 0 } }
    ];

    const countPipeline: mongoose.PipelineStage[] = [...baseStages, { $count: 'total' }];

    const [aggResult] = await Order.aggregate([
      {
        $facet: {
          rows: dataPipeline as never,
          countArr: countPipeline as never
        }
      }
    ]);

    const total = (aggResult as { countArr?: { total: number }[] })?.countArr?.[0]?.total ?? 0;
    const orders = (aggResult as { rows?: Record<string, unknown>[] })?.rows ?? [];

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || (total > 0 ? 1 : 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch delivery history',
      details: (error as Error).message
    });
  }
};

export const getMyDeliveryEarnings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const agentId = new Types.ObjectId(req.user.userId);
    const now = new Date();
    const weekStart = startOfCalendarWeek(now);
    const monthStart = startOfCalendarMonth(now);

    const baseStages: mongoose.PipelineStage[] = [
      { $match: completedDeliveryMatch(agentId) },
      {
        $addFields: {
          completionAt: {
            $ifNull: ['$driverHandoffAt', { $ifNull: ['$deliveredAt', '$updatedAt'] }]
          }
        }
      }
    ];

    const [aggResult] = await Order.aggregate([
      ...baseStages,
      {
        $facet: {
          thisWeek: [
            { $match: { completionAt: { $gte: weekStart, $lte: now } } },
            { $group: { _id: null, total: { $sum: '$deliveryFee' } } }
          ],
          thisMonth: [
            { $match: { completionAt: { $gte: monthStart, $lte: now } } },
            { $group: { _id: null, total: { $sum: '$deliveryFee' } } }
          ],
          allTime: [{ $group: { _id: null, total: { $sum: '$deliveryFee' } } }],
          recent: [
            { $sort: { completionAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'pharmacies',
                localField: 'pharmacyId',
                foreignField: '_id',
                as: '_ph'
              }
            },
            {
              $addFields: {
                pharmacyId: {
                  $let: {
                    vars: { p: { $arrayElemAt: ['$_ph', 0] } },
                    in: {
                      _id: '$$p._id',
                      businessName: '$$p.businessName',
                      address: '$$p.address'
                    }
                  }
                }
              }
            },
            { $project: { _ph: 0 } }
          ]
        }
      }
    ]);

    const facet = aggResult as {
      thisWeek?: { total?: number }[];
      thisMonth?: { total?: number }[];
      allTime?: { total?: number }[];
      recent?: Record<string, unknown>[];
    };

    const weekRow = facet?.thisWeek?.[0];
    const monthRow = facet?.thisMonth?.[0];
    const allRow = facet?.allTime?.[0];
    const recent = facet?.recent ?? [];

    res.json({
      success: true,
      data: {
        thisWeek: Number(weekRow?.total ?? 0),
        thisMonth: Number(monthRow?.total ?? 0),
        allTime: Number(allRow?.total ?? 0),
        recent
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch earnings',
      details: (error as Error).message
    });
  }
};
