import { NextResponse, type NextRequest } from "next/server"
import { getAdmin } from "@/lib/supabase-admin"
import { clientIp } from "@/lib/auth-server"
import { rateLimited } from "@/lib/widget-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Регистрация без письма-подтверждения: человек сразу попадает в кабинет.
// Почту он подтверждает позже, при оплате (на неё приходит чек и подтверждение).
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""

  if (!EMAIL.test(email) || email.length > 200) {
    return NextResponse.json({ error: "Проверьте адрес почты" }, { status: 400 })
  }
  if (password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "Пароль должен быть не короче 8 символов" }, { status: 400 })
  }
  if (rateLimited(`signup:${clientIp(request)}`, 5, 60 * 60_000)) {
    return NextResponse.json({ error: "Слишком много попыток. Попробуйте через час." }, { status: 429 })
  }

  try {
    const { error } = await getAdmin().auth.admin.createUser({ email, password, email_confirm: true })
    if (error) {
      const exists = /already|registered|exists/i.test(error.message)
      return NextResponse.json(
        { error: exists ? "Аккаунт с этой почтой уже есть. Войдите или восстановите пароль." : "Не удалось создать аккаунт" },
        { status: exists ? 409 : 400 },
      )
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("signup:", err)
    return NextResponse.json({ error: "Ошибка сервера. Попробуйте позже." }, { status: 500 })
  }
}
