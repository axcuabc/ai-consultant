import { createClient } from "@supabase/supabase-js"

// Создаём клиент для работы с Supabase (для клиента)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Клиент для серверных операций (для администрирования)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Purchase = {
  id: string
  user_id: string
  email: string
  item_name: string
  amount: number
  payment_id?: string
  status: string
  created_at: string
}
