import { NextResponse, type NextRequest } from "next/server"
import { PLAN, priceFor, type PaymentKind } from "@/lib/plans"
import { createPayment } from "@/lib/yookassa"
import { getAdmin, siteUrl } from "@/lib/supabase-admin"
import { userFromRequest } from "@/lib/auth-server"

export const runtime = "nodejs"
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
    const amount = priceFor(kind)
    const base = siteUrl() || request.nextUrl.origin

    const payment = await createPayment({
      amount,
      description:
        kind === "renew"
          ? `ИИ Консультант: продление на ${PLAN.periodDays} дней`
          : `ИИ Консультант: подключение и ${PLAN.periodDays} дней`,
      returnUrl: `${base}/payment/success`,
      metadata: { user_id: user.id, email, kind },
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
