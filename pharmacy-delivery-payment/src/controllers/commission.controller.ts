import { Response } from 'express';
import mongoose from 'mongoose';
import Pharmacy from '../models/Pharmacy';
import CommissionPayment from '../models/CommissionPayment';
import { AuthRequest } from '../middleware/auth';
import {
  getAccruedThisMonthEtb,
  getOutstandingDebtEtb,
  initiateCommissionChapaCheckout,
  verifyAndFinalizeCommissionPaymentByTxRef
} from '../services/commission.service';

export async function getCommissionSummary(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    const pharmacyOid = pharmacy._id as mongoose.Types.ObjectId;
    const [outstandingDebtEtb, accruedThisMonthEtb] = await Promise.all([
      getOutstandingDebtEtb(pharmacyOid),
      getAccruedThisMonthEtb(pharmacyOid)
    ]);

    res.json({
      success: true,
      data: {
        outstandingDebtEtb,
        accruedThisMonthEtb
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load commission summary',
      details: (error as Error).message
    });
  }
}

export async function initiateCommissionChapa(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const amountRaw = (req.body as { amount?: number })?.amount;
    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId });

    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    let result;
    try {
      result = await initiateCommissionChapaCheckout({
        pharmacyId: pharmacy._id as mongoose.Types.ObjectId,
        ownerUserId: new mongoose.Types.ObjectId(req.user.userId),
        amountRequested: amountRaw != null ? Number(amountRaw) : undefined
      });
    } catch (e) {
      const msg = (e as Error).message || '';
      if (msg.includes('No outstanding commission') || msg.includes('Invalid amount')) {
        res.status(400).json({ success: false, error: msg });
        return;
      }
      throw e;
    }

    res.json({
      success: true,
      data: {
        checkoutUrl: result.checkoutUrl,
        txRef: result.txRef,
        commissionPaymentId: String(result.payment._id)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to initiate commission payment',
      details: (error as Error).message
    });
  }
}

export async function getCommissionPaymentById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid id' });
      return;
    }

    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    const payment = await CommissionPayment.findById(id).lean();
    if (!payment) {
      res.status(404).json({ success: false, error: 'Commission payment not found' });
      return;
    }

    if (String(payment.pharmacyId) !== String(pharmacy._id)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commission payment',
      details: (error as Error).message
    });
  }
}

export async function verifyCommissionPaymentById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid id' });
      return;
    }

    const pharmacy = await Pharmacy.findOne({ ownerId: req.user.userId }).lean();
    if (!pharmacy) {
      res.status(404).json({ success: false, error: 'Pharmacy not found' });
      return;
    }

    const existing = await CommissionPayment.findById(id);
    if (!existing) {
      res.status(404).json({ success: false, error: 'Commission payment not found' });
      return;
    }

    if (String(existing.pharmacyId) !== String(pharmacy._id)) {
      res.status(403).json({ success: false, error: 'Forbidden' });
      return;
    }

    const updated = await verifyAndFinalizeCommissionPaymentByTxRef(existing.txRef);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Commission payment not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Commission payment verified',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify commission payment',
      details: (error as Error).message
    });
  }
}
