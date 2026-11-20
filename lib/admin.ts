import type { NextRequest } from "next/server"
import type { User } from "@supabase/supabase-js"
import { userFromRequest } from "./auth-server"

/** Почты админов через запятую в переменной ADMIN_EMAILS. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.trim().toLowerCase())
}

export async function adminFromRequest(request: NextRequest): Promise<User | null> {
  const user = await userFromRequest(request)
  return user && isAdminEmail(user.email) ? user : null
}
