import { Response } from 'express';
import bcrypt from 'bcryptjs';
import PharmacyDeliveryUser from '../models/PharmacyDeliveryUser';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';

export const userSignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, email, phone, password, region, city } = req.body;

    const existingUser = await PharmacyDeliveryUser.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await PharmacyDeliveryUser.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: 'user',
      region,
      city,
      status: 'active',
      isVerified: true
    });

    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id, user.email, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          region: user.region,
          city: user.city,
          status: user.status,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: (error as Error).message
    });
  }
};

export const pharmacySignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      businessName,
      businessNameAmharic,
      licenseNumber,
      licenseImageUrl,
      tinNumber,
      address
    } = req.body;

    const existingUser = await PharmacyDeliveryUser.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await PharmacyDeliveryUser.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: 'pharmacy',
      businessName,
      businessNameAmharic,
      licenseNumber,
      licenseImageUrl,
      tinNumber,
      address,
      status: 'pending_verification',
      isVerified: false
    });

    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id, user.email, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Pharmacy registered successfully. Awaiting verification.',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          businessName: user.businessName,
          status: user.status,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: (error as Error).message
    });
  }
};

export const deliverySignup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      vehicleType,
      vehiclePlate,
      nationalId,
      driverLicenseNumber
    } = req.body;

    const existingUser = await PharmacyDeliveryUser.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? 'Email already registered' 
          : 'Phone number already registered'
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await PharmacyDeliveryUser.create({
      fullName,
      email,
      phone,
      passwordHash,
      role: 'delivery',
      vehicleType,
      vehiclePlate,
      nationalId,
      driverLicenseNumber,
      status: 'active',
      isVerified: true
    });

    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id, user.email, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Delivery account created successfully',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          vehicleType: user.vehicleType,
          status: user.status,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      details: (error as Error).message
    });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await PharmacyDeliveryUser.findOne({ email });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: 'Account suspended. Please contact support.'
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id, user.email, user.role);
    const refreshToken = generateRefreshToken(user._id, user.email, user.role);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          businessName: user.businessName,
          vehicleType: user.vehicleType,
          status: user.status,
          isVerified: user.isVerified
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed',
      details: (error as Error).message
    });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token required'
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await PharmacyDeliveryUser.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
      return;
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user._id, user.email, user.role);

    // Save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    // Clear refresh token
    await PharmacyDeliveryUser.findByIdAndUpdate(req.user.userId, {
      refreshToken: null
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    const user = await PharmacyDeliveryUser.findById(req.user.userId).select('-passwordHash -refreshToken');

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};
