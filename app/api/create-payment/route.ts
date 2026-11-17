import { NextResponse, type NextRequest } from "next/server"
import { PLAN, priceFor, type PaymentKind } from "@/lib/plans"
import { createPayment } from "@/lib/yookassa"
import { siteUrl } from "@/lib/supabase-admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const kind: PaymentKind = body.kind === "renew" ? "renew" : "start"

    if (!EMAIL.test(email) || email.length > 200) {
      return NextResponse.json({ success: false, error: "Проверьте email" }, { status: 400 })
    }

    // Сумма считается только на сервере: клиент не может её подменить
    const amount = priceFor(kind)
    const base = siteUrl() || request.nextUrl.origin
    const payment = await createPayment({
      amount,
      description:
        kind === "renew"
          ? `ИИ-Консультант: продление на ${PLAN.periodDays} дней`
          : `ИИ-Консультант: подключение и ${PLAN.periodDays} дней доступа`,
      returnUrl: `${base}/payment/success?email=${encodeURIComponent(email)}`,
      metadata: { email, kind },
    })

    return NextResponse.json({ success: true, paymentUrl: payment.confirmationUrl })
  } catch (error) {
    console.error("create-payment:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Не удалось создать платёж" },
      { status: 500 },
    )
  }
}
