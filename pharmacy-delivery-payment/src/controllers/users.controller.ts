import { Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

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

    const address = req.body || {};

    if (address.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(address);
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

    Object.assign(address, req.body);

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
