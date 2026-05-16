import mongoose from 'mongoose';
import CommissionAccrual from '../models/CommissionAccrual';
import CommissionPayment from '../models/CommissionPayment';
import { IOrder } from '../types';
import { chapaService } from './chapa.service';
import { getCommissionEtbPerDeliveredOrder } from './platform-commission-settings.service';
import User from '../models/User';
const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const resolveChapaEmail = (candidate: string): string => {
  const cleaned = String(candidate || '').trim().toLowerCase();
  if (isValidEmail(cleaned)) return cleaned;
  return String(process.env.CHAPA_FALLBACK_EMAIL || 'abebech_bekele@gmail.com').trim().toLowerCase();
};

async function totalsForPharmacy(pharmacyId: mongoose.Types.ObjectId): Promise<{
  accruedTotal: number;
  paidSuccessTotal: number;
}> {
  const [accAgg, payAgg] = await Promise.all([
    CommissionAccrual.aggregate<{ _id: null; total: number }>([
      { $match: { pharmacyId } },
      { $group: { _id: null, total: { $sum: '$amountEtb' } } }
    ]),
    CommissionPayment.aggregate<{ _id: null; total: number }>([
      { $match: { pharmacyId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);
  const accruedTotal = accAgg[0]?.total ?? 0;
  const paidSuccessTotal = payAgg[0]?.total ?? 0;
  return { accruedTotal, paidSuccessTotal };
}

export async function getOutstandingDebtEtb(pharmacyId: mongoose.Types.ObjectId): Promise<number> {
  const { accruedTotal, paidSuccessTotal } = await totalsForPharmacy(pharmacyId);
  return Math.max(0, accruedTotal - paidSuccessTotal);
}

/** Accrued commissions with createdAt in current calendar month (UTC). */
export async function getAccruedThisMonthEtb(pharmacyId: mongoose.Types.ObjectId): Promise<number> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const agg = await CommissionAccrual.aggregate<{ _id: null; total: number }>([
    { $match: { pharmacyId, createdAt: { $gte: start } } },
    { $group: { _id: null, total: { $sum: '$amountEtb' } } }
  ]);
  return agg[0]?.total ?? 0;
}

export async function recordCommissionAccrualIfEligible(
  order: Pick<IOrder, '_id' | 'pharmacyId' | 'status'>
): Promise<void> {
  if (order.status !== 'delivered') return;

  const rate = await getCommissionEtbPerDeliveredOrder();
  if (rate <= 0) return;

  try {
    await CommissionAccrual.create({
      pharmacyId: order.pharmacyId,
      orderId: order._id,
      amountEtb: rate
    });
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 11000) return;
    throw err;
  }
}

function generateCommissionTxRef(pharmacyId: string): string {
  return `medcare-ccy-${pharmacyId}-${Date.now()}`;
}

/** Chapa: max 50 chars; letters, digits, hyphen, underscore, space, dot only (no unicode dashes etc.). */
function chapaCommissionCustomizationDescription(pharmacyId: string): string {
  const idHex = String(pharmacyId).replace(/[^a-fA-F0-9]/g, '').slice(-8);
  const tail = idHex.length > 0 ? idHex : 'pharmacy';
  let text = `MedCare commission ${tail}`;
  text = text.replace(/[^a-zA-Z0-9\-_. ]/g, '').replace(/\s+/g, ' ').trim();
  return text.slice(0, 50);
}

export async function initiateCommissionChapaCheckout(params: {
  pharmacyId: mongoose.Types.ObjectId;
  ownerUserId: mongoose.Types.ObjectId;
  amountRequested?: number;
}): Promise<{
  payment: mongoose.Document & { _id: mongoose.Types.ObjectId; txRef: string; checkoutUrl?: string };
  checkoutUrl?: string;
  txRef: string;
}> {
  const outstanding = await getOutstandingDebtEtb(params.pharmacyId);
  if (outstanding <= 0) {
    throw new Error('No outstanding commission balance');
  }

  let amount = params.amountRequested != null ? Number(params.amountRequested) : outstanding;
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid amount');
  }
  amount = Math.min(amount, outstanding);
  amount = Math.round(amount * 100) / 100;

  const user = await User.findById(params.ownerUserId).lean();
  if (!user) throw new Error('User not found');

  const txRef = generateCommissionTxRef(String(params.pharmacyId));

  const payment = await CommissionPayment.create({
    pharmacyId: params.pharmacyId,
    ownerUserId: params.ownerUserId,
    txRef,
    amount,
    currency: 'ETB',
    paymentMethod: 'chapa',
    status: 'initiated',
    mode: process.env.CHAPA_MODE || 'test'
  });

  let email = resolveChapaEmail(String(user.email || ''));
  const userName = user.username || 'Pharmacy';
  const nameParts = userName.split(/\s+/);
  const firstName = nameParts[0] || 'Pharmacy';
  const lastName = nameParts.slice(1).join(' ') || 'Owner';

  const callbackUrl =
    process.env.CHAPA_CALLBACK_URL ||
    `${process.env.API_URL || 'http://localhost:5000'}/api/v1/payments/chapa/webhook`;

  const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pharmacy/commission-payment/callback?commission_payment_id=${payment._id}`;

  const chapaDescription = chapaCommissionCustomizationDescription(String(params.pharmacyId));

  let chapaResponse;
  try {
    chapaResponse = await chapaService.initializePayment({
      amount,
      currency: 'ETB',
      email,
      first_name: firstName,
      last_name: lastName,
      phone_number: user.phone,
      tx_ref: txRef,
      callback_url: callbackUrl,
      return_url: returnUrl,
      customization: {
        title: 'MedCare Ethiopia',
        description: chapaDescription,
        logo: undefined
      }
    });
  } catch (initError) {
    const initMessage = (initError as Error)?.message || '';
    const fallbackEmail = resolveChapaEmail('');
    if (initMessage.includes('validation.email') && email !== fallbackEmail) {
      email = fallbackEmail;
      chapaResponse = await chapaService.initializePayment({
        amount,
        currency: 'ETB',
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: user.phone,
        tx_ref: txRef,
        callback_url: callbackUrl,
        return_url: returnUrl,
        customization: {
          title: 'MedCare Ethiopia',
          description: chapaDescription,
          logo: undefined
        }
      });
    } else {
      await CommissionPayment.findByIdAndDelete(payment._id);
      throw initError;
    }
  }

  const checkoutUrl = chapaResponse.data.checkout_url;
  payment.checkoutUrl = checkoutUrl;
  await payment.save();

  return {
    payment: payment as mongoose.Document & { _id: mongoose.Types.ObjectId; txRef: string; checkoutUrl?: string },
    checkoutUrl,
    txRef
  };
}

/** Server-side Chapa verification; finalizes credit when status becomes success (idempotent). */
export async function verifyAndFinalizeCommissionPaymentByTxRef(
  txRef: string,
  webhookBody?: Record<string, unknown>,
  webhookReceivedAt?: Date
): Promise<InstanceType<typeof CommissionPayment> | null> {
  let commission = await CommissionPayment.findOne({ txRef });
  if (!commission) return null;

  if (webhookBody) {
    commission.webhookPayload = webhookBody;
    commission.webhookReceivedAt = webhookReceivedAt ?? new Date();
    const wb = webhookBody as { reference?: string; status?: string; payment_method?: string; mode?: string };
    commission.chapaReference = wb.reference ?? commission.chapaReference;
    commission.chapaStatus = wb.status ?? commission.chapaStatus;
    commission.paymentMethod = wb.payment_method || commission.paymentMethod;
    commission.mode = wb.mode ?? commission.mode;
    await commission.save();
  }

  commission = await CommissionPayment.findOne({ txRef });
  if (!commission) return null;
  if (commission.status === 'success' || commission.status === 'failed') {
    return commission;
  }

  try {
    const chapaVerification = await chapaService.verifyPayment(txRef);
    const chapaOk = chapaVerification.data.status === 'success';

    const chapaAmount = parseFloat(chapaVerification.data.amount);
    const credited = Number.isFinite(chapaAmount)
      ? Math.min(chapaAmount, commission.amount)
      : commission.amount;

    await CommissionPayment.findOneAndUpdate(
      {
        _id: commission._id,
        txRef,
        status: { $in: ['initiated', 'pending'] }
      },
      {
        $set: {
          chapaReference: chapaVerification.data.reference,
          chapaStatus: chapaVerification.data.status,
          verifiedAt: new Date(),
          mode: chapaVerification.data.mode,
          paymentMethod: chapaVerification.data.method || commission.paymentMethod,
          chapaCharge: parseFloat(chapaVerification.data.charge || '0'),
          status: chapaOk ? 'success' : 'failed',
          ...(chapaOk ? { amount: credited } : {})
        }
      },
      { new: true }
    );

    return CommissionPayment.findById(commission._id);
  } catch {
    await CommissionPayment.findOneAndUpdate(
      { _id: commission._id, status: 'initiated' },
      {
        $set: { status: 'pending', verifiedAt: new Date() }
      }
    );
    return CommissionPayment.findById(commission._id);
  }
}
