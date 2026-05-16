import bcrypt from "bcrypt";
import crypto from "crypto";
import mongoose from "mongoose";
import { User, type IUser } from "../models/User.js";
import { Pharmacy } from "../models/Pharmacy.js";
import { Driver, type DriverVehicleType } from "../models/Driver.js";
import { authRepository } from "../repositories/auth.repository.js";
import { authService } from "./auth.service.js";
import { normalizeEthiopiaPhone } from "../utils/phone.js";

const BCRYPT_ROUNDS = 10;

function slugUsername(base: string, fallback: string): string {
  const s = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 22);
  return s || fallback;
}

async function ensureUniqueUsername(candidateBase: string): Promise<string> {
  const base = slugUsername(candidateBase, "user");
  for (let i = 0; i < 8; i++) {
    const suffix = i === 0 ? "" : `_${crypto.randomBytes(2).toString("hex")}`;
    const candidate = `${base}${suffix}`.slice(0, 32);
    const exists = await authRepository.findUserByUsername(candidate);
    if (!exists) return candidate;
  }
  return `${base}_${crypto.randomBytes(5).toString("hex")}`.slice(0, 32);
}

/** Maps DeliverySignupForm select values to stored enum */
export function mapUiVehicleToStored(ui: string): DriverVehicleType {
  const m: Record<string, DriverVehicleType> = {
    Motorcycle: "motorcycle",
    Bicycle: "bicycle",
    "On Foot": "on_foot",
    "Three-Wheeler (Bajaj)": "three_wheeler",
    Car: "car",
  };
  return m[ui] ?? "motorcycle";
}

export const registrationService = {
  async registerPatient(body: {
    username: string;
    email: string;
    password: string;
    phone: string;
    language?: "en" | "am";
  }) {
    const email = body.email.toLowerCase().trim();
    const username = body.username.trim();
    const phone = normalizeEthiopiaPhone(body.phone);

    if (await authRepository.findUserByEmailAny(email)) {
      return { error: { message: "Email already registered", code: "DUPLICATE_EMAIL", status: 409 } };
    }
    if (await authRepository.findUserByUsername(username)) {
      return { error: { message: "Username already taken", code: "DUPLICATE_USERNAME", status: 409 } };
    }
    if (await authRepository.findUserByPhone(phone)) {
      return { error: { message: "Phone already registered", code: "DUPLICATE_PHONE", status: 409 } };
    }

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    const user = await User.create({
      username,
      email,
      phone,
      passwordHash,
      role: "patient",
      language: body.language ?? "en",
      isActive: true,
      isLocked: false,
      failedLoginAttempts: 0,
      mfa: { enabled: false, backupCodes: [] },
      addresses: [],
    });

    const saved = (await authRepository.findUserById(String(user._id))) as IUser;
    return authService.issueSessionForUser(saved);
  },

  async registerPharmacy(body: {
    businessName: string;
    email: string;
    password: string;
    phone: string;
    businessLicenseNumber: string;
    issuingAuthority?: string;
    businessLicenseExpiry?: string;
    professionalLicenseExpiry?: string;
    businessRegistrationUrl?: string;
    operatingLicenseUrl?: string;
    location?: string;
    address?: string;
    language?: "en" | "am";
  }) {
    const email = body.email.toLowerCase().trim();
    const phone = normalizeEthiopiaPhone(body.phone);

    if (await authRepository.findUserByEmailAny(email)) {
      return { error: { message: "Email already registered", code: "DUPLICATE_EMAIL", status: 409 } };
    }
    if (await authRepository.findUserByPhone(phone)) {
      return { error: { message: "Phone already registered", code: "DUPLICATE_PHONE", status: 409 } };
    }

    const ownerUsername = await ensureUniqueUsername(body.businessName);
    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    const user = await User.create({
      username: ownerUsername,
      email,
      phone,
      passwordHash,
      role: "pharmacy",
      language: body.language ?? "en",
      isActive: true,
      isLocked: false,
      failedLoginAttempts: 0,
      mfa: { enabled: false, backupCodes: [] },
      addresses: [],
    });

    const now = new Date();
    const businessLicenseExpiry = body.businessLicenseExpiry
      ? new Date(body.businessLicenseExpiry)
      : undefined;
    const professionalLicenseExpiry = body.professionalLicenseExpiry
      ? new Date(body.professionalLicenseExpiry)
      : undefined;

    await Pharmacy.create({
      ownerId: user._id,
      businessName: body.businessName.trim(),
      location: body.location?.trim(),
      address: body.address?.trim(),
      phone,
      email,
      description: "New pharmacy awaiting license verification",
      deliveryAvailable: false,
      deliveryFee: 0,
      license: {
        businessLicenseNumber: body.businessLicenseNumber.trim(),
        businessLicenseExpiry,
        professionalLicenseExpiry,
        issuingAuthority: body.issuingAuthority?.trim(),
      },
      verification: {
        status: "pending",
        rejectionNote: null,
        documents: {
          businessRegistration: body.businessRegistrationUrl
            ? { url: body.businessRegistrationUrl, status: "pending", uploadedAt: now }
            : undefined,
          operatingLicense: body.operatingLicenseUrl
            ? { url: body.operatingLicenseUrl, status: "pending", uploadedAt: now }
            : undefined,
        },
      },
      stats: { rating: 0, reviewCount: 0 },
      isActive: false,
      isOpen: false,
    });

    const saved = (await authRepository.findUserById(String(user._id))) as IUser;
    return authService.issueSessionForUser(saved);
  },

  async registerDelivery(body: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    nationalId: string;
    vehicleType: string;
    licensePlate?: string;
    pharmacyId: string;
    language?: "en" | "am";
  }) {
    const email = body.email.toLowerCase().trim();
    const phone = normalizeEthiopiaPhone(body.phone);
    const pharmacyId = body.pharmacyId.trim();

    if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
      return { error: { message: "Invalid pharmacy", code: "INVALID_PHARMACY", status: 400 } };
    }

    const pharmacy = await Pharmacy.findById(pharmacyId).lean();
    if (!pharmacy) {
      return { error: { message: "Pharmacy not found", code: "PHARMACY_NOT_FOUND", status: 404 } };
    }
    if (pharmacy.verification?.status !== "approved" || !pharmacy.isActive) {
      return {
        error: {
          message: "Selected pharmacy is not available for driver registration",
          code: "PHARMACY_NOT_APPROVED",
          status: 400,
        },
      };
    }

    if (await authRepository.findUserByEmailAny(email)) {
      return { error: { message: "Email already registered", code: "DUPLICATE_EMAIL", status: 409 } };
    }

    if (await authRepository.findUserByPhone(phone)) {
      return { error: { message: "Phone already registered", code: "DUPLICATE_PHONE", status: 409 } };
    }

    const username = await ensureUniqueUsername(body.fullName);

    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);
    const vehicleType = mapUiVehicleToStored(body.vehicleType);

    const user = await User.create({
      username,
      email,
      phone,
      passwordHash,
      role: "delivery",
      language: body.language ?? "en",
      isActive: true,
      isLocked: false,
      failedLoginAttempts: 0,
      mfa: { enabled: false, backupCodes: [] },
      addresses: [],
    });

    const licensePlate =
      vehicleType === "on_foot" || vehicleType === "bicycle"
        ? body.licensePlate?.trim() || undefined
        : body.licensePlate?.trim();

    await Driver.create({
      _id: user._id,
      pharmacyId: new mongoose.Types.ObjectId(pharmacyId),
      vehicleType,
      nationalId: body.nationalId.trim(),
      licensePlate: licensePlate || undefined,
      isOnline: false,
      stats: {
        totalDelivered: 0,
        earnings: { today: 0, thisWeek: 0, thisMonth: 0 },
      },
    });

    const saved = (await authRepository.findUserById(String(user._id))) as IUser;
    return authService.issueSessionForUser(saved);
  },
};
