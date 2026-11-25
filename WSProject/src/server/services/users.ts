import "server-only";
import { isValidObjectId, mongo, type Types } from "mongoose";
import { connectDb } from "../db";
import { Product } from "../models/Product";
import { User, type UserDoc } from "../models/User";
import { ServiceError } from "./errors";
import type { GoogleProfile } from "../integrations/google/oauth";
import { generateTempPassword, hashPassword, verifyPassword } from "./password";
import type { AddressInput, Identifier, RegisterInput, UserDTO } from "@/lib/schemas/user";

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

type LeanUser = UserDoc & { _id: Types.ObjectId; createdAt: Date };

function toDTO(doc: LeanUser): UserDTO {
  const a = doc.address;
  return {
    id: doc._id.toString(),
    name: doc.name,
    phone: doc.phone ?? null,
    email: doc.email ?? null,
    avatarUrl: doc.avatarUrl ?? null,
    hasPassword: !!doc.passwordHash,
    hasGoogle: !!doc.googleSub,
    sessionVersion: doc.sessionVersion ?? 0,
    address: a ? { name: a.name, phone: a.phone, province: a.province, ward: a.ward, address: a.address } : null,
    wishlist: (doc.wishlist ?? []).map((id) => id.toString()),
    createdAt: doc.createdAt.toISOString(),
  };
}

function duplicateField(err: unknown): "phone" | "email" | null {
  if (!(err instanceof mongo.MongoServerError) || err.code !== 11000) return null;
  const key = Object.keys(err.keyPattern ?? {})[0];
  return key === "phone" || key === "email" ? key : null;
}

function byIdentifier(id: Identifier) {
  return id.kind === "phone" ? { phone: id.value } : { email: id.value };
}

// Login step 1: does an account exist, and can it log in with a password?
export async function lookupIdentifier(id: Identifier): Promise<{ exists: boolean; hasPassword: boolean }> {
  await connectDb();
  const doc = await User.findOne(byIdentifier(id), { passwordHash: 1 }).lean<LeanUser>();
  return { exists: !!doc, hasPassword: !!doc?.passwordHash };
}

export async function registerUser(input: RegisterInput): Promise<UserDTO> {
  await connectDb();
  try {
    const doc = await User.create({
      name: input.name,
      phone: input.phone,
      email: input.email || undefined,
      passwordHash: await hashPassword(input.password),
    });
    return toDTO(doc.toObject() as LeanUser);
  } catch (err) {
    const field = duplicateField(err);
    if (field === "phone") throw new ServiceError("Số điện thoại này đã có tài khoản. Hãy đăng nhập.", "phone");
    if (field === "email") throw new ServiceError("Email này đã có tài khoản. Hãy đăng nhập.", "email");
    throw err;
  }
}

export async function loginWithPassword(id: Identifier, password: string, now = new Date()): Promise<UserDTO> {
  await connectDb();
  const doc = await User.findOne(byIdentifier(id)).lean<LeanUser>();
  if (!doc || !doc.passwordHash) throw new ServiceError("Sai thông tin đăng nhập.", "password");

  if (doc.lockedUntil && doc.lockedUntil > now) {
    const minutes = Math.ceil((doc.lockedUntil.getTime() - now.getTime()) / 60000);
    throw new ServiceError(`Bạn đã nhập sai quá nhiều lần. Thử lại sau ${minutes} phút.`, "password");
  }

  if (!(await verifyPassword(password, doc.passwordHash))) {
    const failed = (doc.failedLoginCount ?? 0) + 1;
    const locked = failed >= MAX_FAILED_LOGINS;
    await User.updateOne(
      { _id: doc._id },
      locked
        ? { $set: { failedLoginCount: 0, lockedUntil: new Date(now.getTime() + LOCK_MINUTES * 60000) } }
        : { $set: { failedLoginCount: failed } },
    );
    throw new ServiceError(
      locked
        ? `Bạn đã nhập sai quá nhiều lần. Thử lại sau ${LOCK_MINUTES} phút.`
        : `Mật khẩu không đúng (còn ${MAX_FAILED_LOGINS - failed} lần thử).`,
      "password",
    );
  }

  await User.updateOne({ _id: doc._id }, { $set: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: now } });
  return toDTO(doc);
}

// Google login: by Google id, else link to the account with the same email, else create one.
export async function upsertGoogleUser(profile: GoogleProfile): Promise<UserDTO> {
  await connectDb();
  const refreshed = { name: profile.name, avatarUrl: profile.picture, lastLoginAt: new Date() };

  const linked = await User.findOneAndUpdate({ googleSub: profile.sub }, { $set: refreshed }, { returnDocument: "after" }).lean<LeanUser>();
  if (linked) return toDTO(linked);

  const sameEmail = await User.findOne({ email: profile.email }).lean<LeanUser>();
  if (sameEmail) {
    // The email was typed at registration and never verified, so whoever set that password may not
    // own the mailbox: drop the password and log out other sessions before handing over the account.
    const untrusted = !sameEmail.emailVerified && !!sameEmail.passwordHash;
    const doc = await User.findByIdAndUpdate(
      sameEmail._id,
      {
        $set: {
          googleSub: profile.sub,
          emailVerified: true,
          avatarUrl: profile.picture,
          lastLoginAt: refreshed.lastLoginAt,
          ...(untrusted ? { passwordHash: null } : {}),
        },
        ...(untrusted ? { $inc: { sessionVersion: 1 } } : {}),
      },
      { returnDocument: "after" },
    ).lean<LeanUser>();
    if (!doc) throw new ServiceError("Không tạo được tài khoản");
    return toDTO(doc);
  }

  const doc = await User.create({
    googleSub: profile.sub,
    email: profile.email,
    emailVerified: true,
    ...refreshed,
  });
  return toDTO(doc.toObject() as LeanUser);
}

export async function getUserById(id: string): Promise<UserDTO | null> {
  if (!isValidObjectId(id)) return null;
  await connectDb();
  const doc = await User.findById(id).lean<LeanUser>();
  return doc ? toDTO(doc) : null;
}

export async function updateUserAddress(id: string, address: AddressInput): Promise<void> {
  await connectDb();
  const res = await User.updateOne({ _id: id }, { $set: { address } }, { runValidators: true });
  if (res.matchedCount === 0) throw new ServiceError("Không tìm thấy tài khoản");
}

// Sets or changes the password (current password required when one exists).
// Logs out other sessions; returns the new session version for re-issuing the current cookie.
export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<number> {
  await connectDb();
  const doc = await User.findById(userId).lean<LeanUser>();
  if (!doc) throw new ServiceError("Không tìm thấy tài khoản");
  if (doc.passwordHash && !(await verifyPassword(currentPassword, doc.passwordHash))) {
    throw new ServiceError("Mật khẩu hiện tại không đúng.", "currentPassword");
  }
  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: { passwordHash: await hashPassword(newPassword), failedLoginCount: 0, lockedUntil: null }, $inc: { sessionVersion: 1 } },
    { returnDocument: "after" },
  ).lean<LeanUser>();
  return updated?.sessionVersion ?? 0;
}

// Adds or removes a visible product; returns whether it is now in the wishlist.
export async function toggleWishlist(userId: string, productId: string): Promise<boolean> {
  if (!isValidObjectId(productId)) throw new ServiceError("Không tìm thấy sản phẩm");
  await connectDb();
  const user = await User.findById(userId, { wishlist: 1 }).lean<LeanUser>();
  if (!user) throw new ServiceError("Không tìm thấy tài khoản");

  const saved = user.wishlist.some((id) => id.toString() === productId);
  if (saved) {
    await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
    return false;
  }
  if (!(await Product.exists({ _id: productId, isVisible: true }))) {
    throw new ServiceError("Không tìm thấy sản phẩm");
  }
  await User.updateOne({ _id: userId }, { $addToSet: { wishlist: productId } });
  return true;
}

// --- Admin

export type AdminCustomerDTO = UserDTO & { locked: boolean; lastLoginAt: string | null };

export async function listCustomersForAdmin(q = ""): Promise<AdminCustomerDTO[]> {
  await connectDb();
  const query: Record<string, unknown> = {};
  if (q) {
    const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: pattern }, { email: pattern }, { phone: pattern }];
  }
  const docs = await User.find(query).sort({ createdAt: -1 }).limit(200).lean<LeanUser[]>();
  const now = new Date();
  return docs.map((d) => ({
    ...toDTO(d),
    locked: !!d.lockedUntil && d.lockedUntil > now,
    lastLoginAt: d.lastLoginAt ? d.lastLoginAt.toISOString() : null,
  }));
}

// Forgot-password flow for the demo: the shop resets it and sends the temp password via Messenger.
export async function adminResetPassword(userId: string): Promise<string> {
  if (!isValidObjectId(userId)) throw new ServiceError("Không tìm thấy khách hàng");
  await connectDb();
  const temp = generateTempPassword();
  const res = await User.updateOne(
    { _id: userId },
    { $set: { passwordHash: await hashPassword(temp), failedLoginCount: 0, lockedUntil: null }, $inc: { sessionVersion: 1 } },
  );
  if (res.matchedCount === 0) throw new ServiceError("Không tìm thấy khách hàng");
  return temp;
}
