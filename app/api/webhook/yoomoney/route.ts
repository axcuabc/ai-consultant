import { NextResponse, type NextRequest } from "next/server"
import { fetchPayment } from "@/lib/yookassa"
import { fulfillPayment } from "@/lib/fulfill"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Уведомления ЮKassa. Адрес для настройки в кабинете ЮKassa:
//   https://ВАШ-ДОМЕН/api/webhook/yoomoney  (событие payment.succeeded)
// Содержимому уведомления мы не доверяем: по id заново запрашиваем платёж у ЮKassa
// и выдаём доступ, только если сама ЮKassa подтверждает оплату.
export async function POST(request: NextRequest) {
  let paymentId: unknown
  try {
    const body = await request.json()
    paymentId = body?.object?.id
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 })
  }
  if (typeof paymentId !== "string") return NextResponse.json({ ok: true })

  try {
    const payment = await fetchPayment(paymentId)
    if (!payment) return NextResponse.json({ ok: true })
    const result = await fulfillPayment(payment)
    console.log(`Webhook ${paymentId}: ${payment.status} → ${result}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Webhook error:", error)
    // 500 → ЮKassa повторит уведомление позже
    return NextResponse.json({ error: "processing_failed" }, { status: 500 })
  }
}
