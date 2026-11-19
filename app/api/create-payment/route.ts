import { NextResponse, type NextRequest } from "next/server"
import { PLAN, priceFor, type PaymentKind } from "@/lib/plans"
import { createPayment } from "@/lib/yookassa"
import { getAdmin, siteUrl } from "@/lib/supabase-admin"
import { userFromRequest } from "@/lib/auth-server"

export const runtime = "nodejs"

// Тестовая оплата для владельца: если почта аккаунта указана в PAYMENT_TEST_EMAILS
// (через запятую), платёж создаётся на PAYMENT_TEST_AMOUNT ₽ (по умолчанию 10 ₽).
// Доступ выдаётся как при обычной оплате. Остальные покупатели платят полную цену.
function testAmountFor(email: string): number | null {
  const list = (process.env.PAYMENT_TEST_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  if (!list.includes(email)) return null
  const value = Number(process.env.PAYMENT_TEST_AMOUNT || 10)
  return Number.isFinite(value) && value >= 1 ? Math.round(value) : 10
}
export const dynamic = "force-dynamic"

// Оплата только из кабинета: пользователь уже вошёл, почта берётся из аккаунта,
// а тип платежа (первый или продление) и сумма считаются на сервере.
export async function POST(request: NextRequest) {
  try {
    const user = await userFromRequest(request)
    if (!user?.email) {
      return NextResponse.json({ success: false, error: "Войдите в кабинет, чтобы оплатить" }, { status: 401 })
    }
    const email = user.email.toLowerCase()

    const { data: profile } = await getAdmin()
      .from("users")
      .select("subscription_ends_at")
      .eq("id", user.id)
      .maybeSingle()
    const kind: PaymentKind = profile?.subscription_ends_at ? "renew" : "start"
    const testAmount = testAmountFor(email)
    const amount = testAmount ?? priceFor(kind)
    const base = siteUrl() || request.nextUrl.origin

    const payment = await createPayment({
      amount,
      description:
        (kind === "renew"
          ? `ИИ Консультант: продление на ${PLAN.periodDays} дней`
          : `ИИ Консультант: подключение и ${PLAN.periodDays} дней`) + (testAmount ? " (тест)" : ""),
      returnUrl: `${base}/payment/success`,
      metadata: { user_id: user.id, email, kind, ...(testAmount ? { test: "1" } : {}) },
    })

    return NextResponse.json({ success: true, paymentUrl: payment.confirmationUrl })
  } catch (error) {
    console.error("create-payment:", error)
    return NextResponse.json(
      { success: false, error: "Не удалось создать платёж. Попробуйте ещё раз через минуту." },
      { status: 500 },
    )
  }
}
