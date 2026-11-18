import type { NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"
import { getAdmin } from "./supabase-admin"

/** Пользователь по токену из заголовка Authorization: Bearer <access_token>. */
export async function userFromRequest(request: NextRequest): Promise<User | null> {
  const header = request.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : ""
  if (!token) return null
  const { data, error } = await getAdmin().auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export function clientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}
