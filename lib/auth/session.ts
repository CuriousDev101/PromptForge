import "server-only";

import { headers } from "next/headers";
import { auth } from "./auth";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedSession {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
}

export interface SessionResult {
  session: AuthenticatedSession;
  user: AuthenticatedUser;
}

/**
 * Retrieve verified session from the incoming request headers using Better Auth.
 * Returns null if no valid session exists.
 */
export async function getServerSession(): Promise<SessionResult | null> {
  const reqHeaders = await headers();
  const sessionData = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!sessionData?.session || !sessionData?.user) {
    return null;
  }

  return sessionData as unknown as SessionResult;
}

/**
 * Enforce that the request has a verified session.
 * Throws an Error with 401 status semantics if unauthenticated.
 */
export async function requireAuth(): Promise<SessionResult> {
  const sessionResult = await getServerSession();
  if (!sessionResult) {
    const error = new Error("Unauthorized: Authentication required");
    (error as unknown as { status: number }).status = 401;
    throw error;
  }
  return sessionResult;
}
