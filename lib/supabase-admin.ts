import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Серверный клиент с service role. Использовать ТОЛЬКО в app/api/*.
// Создаётся лениво, чтобы сборка не падала без переменных окружения.
let admin: SupabaseClient | null = null

export function getAdmin(): SupabaseClient {
  if (!admin) {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    if (!url || !key) throw new Error("Supabase не настроен: нужны SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY")
    admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  }
  return admin
}

export function siteUrl(): string {
  return (process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "")
}
