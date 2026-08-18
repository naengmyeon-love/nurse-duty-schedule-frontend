import "server-only";
import { cookies } from "next/headers";
import type { CurrentUserDto, Role } from "@/lib/domain";

const COOKIE_NAME = "nurse_duty_session";

type ApiEnvelope<T> = { ok: true; data: T } | { ok: false; error: string };
type RpcResult = { ok: boolean; error?: string; redirect?: string };

function backendConfig() {
  const baseUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");
  const sharedSecret = process.env.BACKEND_SHARED_SECRET;
  if (!baseUrl || !/^https?:\/\//.test(baseUrl)) throw new Error("BACKEND_API_URL is not configured");
  if (!sharedSecret || sharedSecret.length < 32) throw new Error("BACKEND_SHARED_SECRET is not configured");
  return { baseUrl, sharedSecret };
}

async function authHeaders(includeJson = false) {
  const { sharedSecret } = backendConfig();
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const headers = new Headers({ "x-frontend-shared-secret": sharedSecret });
  if (includeJson) headers.set("Content-Type", "application/json");
  if (token) headers.set("Cookie", `${COOKIE_NAME}=${encodeURIComponent(token)}`);
  return headers;
}

async function backendRequest(path: string, init: RequestInit = {}) {
  const { baseUrl } = backendConfig();
  return fetch(`${baseUrl}${path}`, { ...init, cache: "no-store" });
}

export async function loginThroughBackend(name: string, employeeNumber: string) {
  const response = await backendRequest("/api/v1/auth/login", {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify({ name, employeeNumber }),
  });
  if (!response.ok) return null;
  const result = await response.json() as { ok: true; token: string; expiresAt: string; user: CurrentUserDto };
  const expiresAt = new Date(result.expiresAt);
  (await cookies()).set(COOKIE_NAME, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    priority: "high",
    path: "/",
    expires: expiresAt,
  });
  return result.user;
}

export async function clearFrontendSession() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const response = await backendRequest("/api/v1/auth/me", { headers: await authHeaders() });
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Backend authentication request failed");
  const result = await response.json() as { ok: true; user: CurrentUserDto };
  return result.user;
}

export async function getView<T>(name: string, params: Record<string, string> = {}) {
  const query = new URLSearchParams({ name, ...params });
  const response = await backendRequest(`/api/v1/view?${query}`, { headers: await authHeaders() });
  if (!response.ok) throw new Error("Backend view request failed");
  const result = await response.json() as ApiEnvelope<T>;
  if (!result.ok) throw new Error("Backend view request failed");
  return result.data;
}

export async function callRpc(action: string, fields: Record<string, string> = {}): Promise<RpcResult> {
  const response = await backendRequest("/api/v1/rpc", {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify({ action, fields }),
  });
  if (!response.ok) return { ok: false, error: response.status === 403 ? "forbidden" : "failed" };
  return response.json() as Promise<RpcResult>;
}

export async function saveScheduleEntry(payload: unknown) {
  return backendRequest("/api/v1/schedule-entry", {
    method: "POST",
    headers: await authHeaders(true),
    body: JSON.stringify(payload),
  });
}

export function roleHome(role: Role) {
  return role === "HEAD_NURSE" ? "/head/dashboard" : "/nurse";
}
