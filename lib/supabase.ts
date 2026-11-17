import { createClient } from "@supabase/supabase-js"

// Клиент для браузера (публичные ключи). Права ограничены политиками RLS.
// Серверный клиент с service role лежит в lib/supabase-admin.ts.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder",
)

export type Purchase = {
  id: string
  user_id: string
  email: string
  item_name: string
  amount: number
  payment_id: string | null
  status: string
  created_at: string
}
