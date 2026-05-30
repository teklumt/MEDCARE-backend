import { Types } from 'mongoose';
import Pharmacy from '../models/Pharmacy';
import Notification from '../models/Notification';

export type OrderNotificationEvent =
  | 'order_pending'
  | 'order_confirmed'
  | 'order_rejected'
  | 'order_cancelled'
  | 'order_dispatched'
  | 'order_delivered'
  | 'delivery_trip_started'
  | 'delivery_handoff';

export type ComplaintNotificationEvent = 'complaint_new_admin';

export interface NotificationPayload {
  category: 'order' | 'complaint';
  event: string;
  title: string;
  body: string;
  entityType: 'order' | 'complaint';
  entityId: Types.ObjectId;
}

export function orderRefLabel(order: { ref?: string; _id: unknown }): string {
  const r = typeof order.ref === 'string' && order.ref.trim() ? order.ref.trim() : '';
  return r || `#${String(order._id)}`;
}

export async function resolvePharmacyOwnerUserId(pharmacyId: Types.ObjectId | string): Promise<string | null> {
  const p = await Pharmacy.findById(pharmacyId).select('ownerId').lean();
  if (!p || !('ownerId' in p) || !(p as { ownerId?: unknown }).ownerId) return null;
  return String((p as { ownerId: Types.ObjectId }).ownerId);
}

function uniqueRecipientStrings(ids: (string | Types.ObjectId | null | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const id of ids) {
    if (id == null) continue;
    const s = typeof id === 'string' ? id : String(id);
    if (!Types.ObjectId.isValid(s)) continue;
    seen.add(s);
  }
  return [...seen];
}

export async function notifyUser(
  recipientId: string | Types.ObjectId | null | undefined,
  payload: NotificationPayload,
): Promise<void> {
  const list = uniqueRecipientStrings([recipientId]);
  if (!list.length) return;
  await notifyManyStrings(list, payload);
}

async function notifyManyStrings(recipientStrings: string[], payload: NotificationPayload): Promise<void> {
  try {
    if (!recipientStrings.length) return;
    const docs = recipientStrings.map((rid) => ({
      recipientId: new Types.ObjectId(rid),
      readAt: null as Date | null,
      ...payload
    }));
    await Notification.insertMany(docs);
  } catch (err) {
    console.error('[notifications] Failed to persist notifications:', (err as Error)?.message);
  }
}

export async function notifyMany(
  recipientIds: (string | Types.ObjectId | null | undefined)[],
  payload: NotificationPayload,
): Promise<void> {
  await notifyManyStrings(uniqueRecipientStrings(recipientIds), payload);
}

export function buildOrderNotificationPayload(
  order: {
    _id: unknown;
    ref?: string;
  },
  event: OrderNotificationEvent,
): NotificationPayload {
  const ref = orderRefLabel(order);
  const entityId = order._id instanceof Types.ObjectId ? order._id : new Types.ObjectId(String(order._id));

  switch (event) {
    case 'order_pending':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'New order',
        body: `Order ${ref} is awaiting your confirmation.`
      };
    case 'order_confirmed':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Order confirmed',
        body: `Your order ${ref} has been confirmed.`
      };
    case 'order_rejected':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Order rejected',
        body: `Your order ${ref} was rejected by the pharmacy.`
      };
    case 'order_cancelled':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Order cancelled',
        body: `Order ${ref} has been cancelled.`
      };
    case 'order_dispatched':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Order dispatched',
        body: `Order ${ref} is on the way.`
      };
    case 'order_delivered':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Order delivered',
        body: `Order ${ref} is marked delivered.`
      };
    case 'delivery_trip_started':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Driver is on the way',
        body: `Your delivery for order ${ref} has started.`
      };
    case 'delivery_handoff':
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Package handed off',
        body: `The driver handed off order ${ref}. Confirm receipt when you have it.`
      };
    default:
      return {
        category: 'order',
        event,
        entityType: 'order',
        entityId,
        title: 'Order update',
        body: `Update for order ${ref}.`
      };
  }
}

export function buildComplaintAdminNotificationPayload(complaint: {
  _id: unknown;
  ref?: string;
  issue: string;
}): NotificationPayload {
  const id = complaint._id instanceof Types.ObjectId ? complaint._id : new Types.ObjectId(String(complaint._id));
  const cref = typeof complaint.ref === 'string' && complaint.ref ? complaint.ref : `#${id}`;
  const issue = String(complaint.issue || '').trim();
  const issuePreview = issue.slice(0, 120);
  return {
    category: 'complaint',
    event: 'complaint_new_admin',
    entityType: 'complaint',
    entityId: id,
    title: 'New complaint',
    body: issuePreview ? `${cref}: ${issuePreview}${issue.length > 120 ? '…' : ''}` : `Complaint ${cref} needs review.`
  };
}

/** After pharmacy updates order status (excludes preparing / ready). */
export async function emitOrderStatusChangeNotifications(order: {
  _id: unknown;
  ref?: string;
  patientId: unknown;
  pharmacyId: unknown;
  deliveryAgentId?: unknown | null;
  deliveryMethod?: string;
  status: string;
}): Promise<void> {
  const st = order.status;
  if (st === 'preparing' || st === 'ready') return;

  const patientId = order.patientId != null ? String(order.patientId) : null;
  const driverId = order.deliveryAgentId != null ? String(order.deliveryAgentId) : null;
  const ownerId = await resolvePharmacyOwnerUserId(String(order.pharmacyId));

  if (st === 'confirmed' && patientId) {
    await notifyUser(patientId, buildOrderNotificationPayload(order, 'order_confirmed'));
    return;
  }
  if (st === 'rejected' && patientId) {
    await notifyUser(patientId, buildOrderNotificationPayload(order, 'order_rejected'));
    return;
  }
  if (st === 'cancelled') {
    const recipients: string[] = [];
    if (patientId) recipients.push(patientId);
    if (driverId) recipients.push(driverId);
    await notifyMany(recipients, buildOrderNotificationPayload(order, 'order_cancelled'));
    return;
  }
  if (st === 'dispatched') {
    const recipients: string[] = [];
    if (patientId) recipients.push(patientId);
    if (driverId) recipients.push(driverId);
    await notifyMany(recipients, buildOrderNotificationPayload(order, 'order_dispatched'));
    return;
  }
  if (st === 'delivered') {
    const recipients: string[] = [];
    if (patientId) recipients.push(patientId);
    if (ownerId) recipients.push(ownerId);
    await notifyMany(recipients, buildOrderNotificationPayload(order, 'order_delivered'));
  }
}

export async function emitPatientCancelledPendingOrder(order: {
  _id: unknown;
  ref?: string;
  pharmacyId: unknown;
}): Promise<void> {
  const ownerId = await resolvePharmacyOwnerUserId(String(order.pharmacyId));
  if (!ownerId) return;
  await notifyUser(ownerId, buildOrderNotificationPayload(order, 'order_cancelled'));
}

export async function emitPatientConfirmedReceipt(order: {
  _id: unknown;
  ref?: string;
  pharmacyId: unknown;
  deliveryAgentId?: unknown | null;
}): Promise<void> {
  const ownerId = await resolvePharmacyOwnerUserId(String(order.pharmacyId));
  const driverId = order.deliveryAgentId != null ? String(order.deliveryAgentId) : null;
  const recipients = [ownerId, driverId].filter(Boolean) as string[];
  await notifyMany(recipients, buildOrderNotificationPayload(order, 'order_delivered'));
}

export async function emitDeliveryTripStarted(order: { _id: unknown; ref?: string; patientId: unknown }): Promise<void> {
  if (!order.patientId) return;
  await notifyUser(String(order.patientId), buildOrderNotificationPayload(order, 'delivery_trip_started'));
}

export async function emitDriverHandoff(order: { _id: unknown; ref?: string; patientId: unknown }): Promise<void> {
  if (!order.patientId) return;
  await notifyUser(String(order.patientId), buildOrderNotificationPayload(order, 'delivery_handoff'));
}

export async function emitNewOrderPendingForPharmacyOwner(order: {
  _id: unknown;
  ref?: string;
  pharmacyId: unknown;
}): Promise<void> {
  const ownerId = await resolvePharmacyOwnerUserId(String(order.pharmacyId));
  if (!ownerId) return;
  await notifyUser(ownerId, buildOrderNotificationPayload(order, 'order_pending'));
}
