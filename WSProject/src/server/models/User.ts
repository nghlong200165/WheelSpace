import "server-only";
import { Schema, deleteModel, model, models, type InferSchemaType, type Model } from "mongoose";

// Customer account. Created by phone/email registration or by the first Google login.
// Guests never get a User document.
const addressSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    ward: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    // Login identifiers; each optional but unique when present (see partial indexes below).
    phone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    // true only when Google confirmed the address; registration emails are not verified.
    emailVerified: { type: Boolean, default: false },
    googleSub: { type: String },
    passwordHash: { type: String, default: null },
    // Bumped to log out every existing session (e.g. password reset, Google account merge).
    sessionVersion: { type: Number, default: 0 },
    failedLoginCount: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    avatarUrl: { type: String, default: null },
    address: { type: addressSchema, default: null },
    wishlist: { type: [{ type: Schema.Types.ObjectId, ref: "Product" }], default: [] },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const whenString = (field: string) => ({ partialFilterExpression: { [field]: { $type: "string" } } });
userSchema.index({ phone: 1 }, { unique: true, ...whenString("phone") });
userSchema.index({ email: 1 }, { unique: true, ...whenString("email") });
userSchema.index({ googleSub: 1 }, { unique: true, ...whenString("googleSub") });

export type UserDoc = InferSchemaType<typeof userSchema>;

// Replace the cached model on dev hot reload (see Product.ts).
if (models.User) deleteModel("User");
export const User: Model<UserDoc> = model<UserDoc>("User", userSchema);
