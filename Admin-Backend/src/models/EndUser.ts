import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEndUser extends Document {
  fullName: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: "end_user";
  region?: string;
  city?: string;
  status: "active" | "banned" | "suspended";
  ban: {
    isBanned: boolean;
    reason?: string;
    type?: "temporary" | "permanent";
    expiresAt?: Date;
    bannedBy?: Types.ObjectId;
  };
  warningCount: number;
  trustScore: number;
  isVerified: boolean;
  refreshToken?: string;
  flags: { reason: string; flaggedBy: Types.ObjectId; flaggedAt: Date }[];
  reportedCount?: number;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const endUserSchema = new Schema<IEndUser>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["end_user"], default: "end_user" },
    region: { type: String },
    city: { type: String },
    status: {
      type: String,
      enum: ["active", "banned", "suspended"],
      default: "active",
      index: true,
    },
    ban: {
      isBanned: { type: Boolean, default: false },
      reason: { type: String },
      type: { type: String, enum: ["temporary", "permanent"] },
      expiresAt: { type: Date },
      bannedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
    },
    warningCount: { type: Number, default: 0 },
    trustScore: { type: Number, default: 100 },
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String },
    flags: {
      type: [
        {
          reason: { type: String },
          flaggedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
          flaggedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    reportedCount: { type: Number, default: 0 },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true, strict: false, minimize: false },
);

endUserSchema.index({ phone: 1 });
endUserSchema.index({ "ban.isBanned": 1 });

export const EndUser = mongoose.model<IEndUser>("User", endUserSchema);
