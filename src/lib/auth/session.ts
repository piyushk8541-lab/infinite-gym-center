import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getStore } from "@/lib/demo/store";
import { hashPassword, signSession, verifyPassword, verifySession } from "@/lib/security";
import type { ActionResult, PublicUser, Role, SessionPayload, User } from "@/types";
import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resetRequestSchema,
} from "@/lib/validation";

const COOKIE_NAME = "igc_session";
const SESSION_MS = 1000 * 60 * 60 * 24 * 7;

function secret(): string {
  return process.env.AUTH_SECRET || "igc-demo-only-secret-change-in-production";
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    emailVerified: user.emailVerified,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token, secret());
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  return getStore().users.find((user) => user.id === session.userId) ?? null;
}

export async function setSessionCookie(user: User): Promise<void> {
  const payload: SessionPayload = {
    userId: user.id,
    role: user.role,
    exp: Date.now() + SESSION_MS,
  };
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, signSession(payload, secret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MS / 1000,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requirePageUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect("/dashboard");
  return user;
}

export class AuthError extends Error {}

export async function requireActionUser(role?: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("You must be signed in to continue.");
  if (role && user.role !== role)
    throw new AuthError("You do not have permission for this action.");
  return user;
}

export async function registerUser(input: unknown): Promise<ActionResult<PublicUser>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const store = getStore();
  if (store.users.some((user) => user.email === parsed.data.email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const user = store.createUser({
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    phone: parsed.data.phone ?? "",
    password: parsed.data.password,
    role: "member",
  });
  await setSessionCookie(user);
  return {
    ok: true,
    data: toPublicUser(user),
    message: "Account created. Demo mode requires a one-click email verification.",
  };
}

export async function loginUser(input: unknown): Promise<ActionResult<PublicUser>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const user = getStore().users.find((candidate) => candidate.email === parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { ok: false, error: "Invalid email or password." };
  }
  await setSessionCookie(user);
  return { ok: true, data: toPublicUser(user), message: "Welcome back." };
}

export async function logoutUser(): Promise<ActionResult> {
  await clearSessionCookie();
  return { ok: true, message: "Signed out." };
}

export async function verifyEmail(userId: string): Promise<ActionResult> {
  const store = getStore();
  const user = store.users.find((candidate) => candidate.id === userId);
  if (!user) return { ok: false, error: "Account not found." };
  user.emailVerified = true;
  store.createNotification({
    userId,
    type: "system",
    title: "Email verified",
    body: "Your demo email has been verified. Production uses Supabase email confirmation.",
  });
  return { ok: true, message: "Email verified (demo simulation)." };
}

export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email." };
  const store = getStore();
  const token = store.createResetToken(parsed.data.email);
  // Never reveal whether an account exists. The demo token is surfaced only in
  // the notification outbox because no email provider is configured.
  return {
    ok: true,
    message: token
      ? "If an account exists, a reset link has been queued. Check demo notifications."
      : "If an account exists, a reset link has been queued.",
  };
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const store = getStore();
  const userId = store.consumeResetToken(parsed.data.token);
  if (!userId) return { ok: false, error: "This reset link is invalid or has expired." };
  const user = store.users.find((candidate) => candidate.id === userId);
  if (!user) return { ok: false, error: "Account not found." };
  user.passwordHash = hashPassword(parsed.data.password);
  return { ok: true, message: "Password updated. You can now sign in." };
}
