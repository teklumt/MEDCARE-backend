import { Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { parseCoordinatesInput } from '../utils/geo';

const BCRYPT_ROUNDS = 10;

function sanitizeAddressInput(raw: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...raw };
  const coords = parseCoordinatesInput(raw.coordinates);
  if (coords) out.coordinates = coords;
  else delete out.coordinates;
  return out;
}

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch profile', details: (error as Error).message });
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { username, email, phone, language } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { username, email, phone, language },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updated) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile', details: (error as Error).message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      res.status(401).json({ success: false, error: 'Current password is incorrect' });
      return;
    }

    const sameAsOld = await bcrypt.compare(newPassword, user.passwordHash);
    if (sameAsOld) {
      res.status(400).json({
        success: false,
        error: 'New password must be different from your current password'
      });
      return;
    }

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update password',
      details: (error as Error).message
    });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId).select('addresses');

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch addresses', details: (error as Error).message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const address = sanitizeAddressInput((req.body || {}) as Record<string, unknown>);

    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address as never);
    await user.save();

    res.status(201).json({ success: true, message: 'Address added', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add address', details: (error as Error).message });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, error: 'Invalid address id' });
      return;
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const address = user.addresses.find((addr) => addr._id?.toString() === id);
    if (!address) {
      res.status(404).json({ success: false, error: 'Address not found' });
      return;
    }

    Object.assign(address, sanitizeAddressInput((req.body || {}) as Record<string, unknown>));

    if (req.body?.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr._id?.toString() !== id) addr.isDefault = false;
      });
    }

    await user.save();

    res.json({ success: true, message: 'Address updated', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update address', details: (error as Error).message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const address = user.addresses.find((addr) => addr._id?.toString() === id);
    if (!address) {
      res.status(404).json({ success: false, error: 'Address not found' });
      return;
    }

    user.set('addresses', user.addresses.filter((addr) => addr._id?.toString() !== id));
    await user.save();

    res.json({ success: true, message: 'Address deleted', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete address', details: (error as Error).message });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const { id } = req.params;

    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const address = user.addresses.find((addr) => addr._id?.toString() === id);
    if (!address) {
      res.status(404).json({ success: false, error: 'Address not found' });
      return;
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = addr._id?.toString() === id;
    });

    await user.save();

    res.json({ success: true, message: 'Default address updated', data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to set default address', details: (error as Error).message });
  }
};
