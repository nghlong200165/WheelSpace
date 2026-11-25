// Checks account rules against the local database (creates and removes its own test users).
//   npm run check:accounts

import { connectDb } from "@/server/db";
import { User } from "@/server/models/User";
import { hashPassword, verifyPassword } from "@/server/services/password";
import { loginWithPassword, registerUser, upsertGoogleUser } from "@/server/services/users";

const TAG = "check-accounts";
let failures = 0;
function check(name: string, ok: boolean) {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
}
const rejects = (p: Promise<unknown>) => p.then(() => false, () => true);

async function main() {
  const mongoose = await connectDb();
  const cleanup = () => User.deleteMany({ name: { $regex: TAG } });
  await cleanup();

  try {
    // Password hashing
    const hash = await hashPassword("mật-khẩu-123");
    check("hash is salted (two hashes differ)", hash !== (await hashPassword("mật-khẩu-123")));
    check("correct password verifies", await verifyPassword("mật-khẩu-123", hash));
    check("wrong password rejected", !(await verifyPassword("mat-khau-123", hash)));

    // Registration + duplicates
    const victimEmail = "victim.check-accounts@example.com";
    const attacker = await registerUser({
      name: `${TAG} attacker`,
      phone: "0900000001",
      email: victimEmail,
      password: "attacker-pass",
      confirmPassword: "attacker-pass",
    });
    check("registered with phone + email", attacker.phone === "0900000001" && attacker.email === victimEmail && attacker.hasPassword);
    check(
      "duplicate phone rejected",
      await rejects(registerUser({ name: `${TAG} dup`, phone: "0900000001", email: "", password: "12345678", confirmPassword: "12345678" })),
    );
    check(
      "duplicate email rejected",
      await rejects(registerUser({ name: `${TAG} dup`, phone: "0900000002", email: victimEmail, password: "12345678", confirmPassword: "12345678" })),
    );
    check(
      "two accounts without email allowed",
      !(await rejects(registerUser({ name: `${TAG} no-email-1`, phone: "0900000003", email: "", password: "12345678", confirmPassword: "12345678" }))) &&
        !(await rejects(registerUser({ name: `${TAG} no-email-2`, phone: "0900000004", email: "", password: "12345678", confirmPassword: "12345678" }))),
    );

    // Login + lockout
    check("login with phone works", (await loginWithPassword({ kind: "phone", value: "0900000001" }, "attacker-pass")).id === attacker.id);
    check("login with email works", (await loginWithPassword({ kind: "email", value: victimEmail }, "attacker-pass")).id === attacker.id);
    for (let i = 0; i < 5; i++) await rejects(loginWithPassword({ kind: "phone", value: "0900000003" }, "wrong"));
    check("locked after 5 wrong passwords (even with the right one)", await rejects(loginWithPassword({ kind: "phone", value: "0900000003" }, "12345678")));

    // Google merge: the real owner of victimEmail logs in with Google
    const before = await User.findById(attacker.id).lean();
    const merged = await upsertGoogleUser({ sub: `${TAG}-google-1`, email: victimEmail, name: "Victim", picture: null });
    const after = await User.findById(attacker.id).lean();
    check("Google login links to the account with the same email", merged.id === attacker.id && merged.hasGoogle);
    check("unverified password removed on merge", !merged.hasPassword && after?.passwordHash === null);
    check("old sessions invalidated on merge", (after?.sessionVersion ?? 0) === (before?.sessionVersion ?? 0) + 1);
    check("attacker can no longer log in with the old password", await rejects(loginWithPassword({ kind: "phone", value: "0900000001" }, "attacker-pass")));
    check("email now marked verified", after?.emailVerified === true);

    // Google login again: same account, nothing reset
    const again = await upsertGoogleUser({ sub: `${TAG}-google-1`, email: victimEmail, name: `${TAG} Victim`, picture: null });
    check("second Google login keeps the same account", again.id === attacker.id && again.sessionVersion === merged.sessionVersion);

    // Brand-new Google user
    const fresh = await upsertGoogleUser({ sub: `${TAG}-google-2`, email: "fresh.check-accounts@example.com", name: `${TAG} fresh`, picture: null });
    check("new Google user created without password", fresh.hasGoogle && !fresh.hasPassword && fresh.phone === null);
  } finally {
    await cleanup();
    await User.deleteMany({ email: { $in: ["victim.check-accounts@example.com", "fresh.check-accounts@example.com"] } });
    await mongoose.disconnect();
  }

  console.log(failures ? `\n${failures} failed` : "\nall passed");
  process.exitCode = failures ? 1 : 0;
}

main();
