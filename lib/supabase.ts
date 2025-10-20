// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// 🔹 Клиент для браузера (использует публичные ключи)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 🔹 Клиент для серверного кода (использует приватные ключи)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // убедись, что в Supabase Settings → API берёшь Service Role Key
);
