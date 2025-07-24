import { type NextRequest, NextResponse } from "next/server"

const YOOMONEY_SECRET_KEY = process.env.YOOMONEY_SECRET_KEY
const BASE_URL = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const webhookData = JSON.parse(rawBody)
    const { event, object: payment } = webhookData

    console.log("Webhook received:", {
      event,
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount?.value,
      email: payment.metadata?.email,
    })

    if (event === "payment.succeeded" && payment.status === "succeeded") {
      const email = payment.metadata?.email
      const amount = Number(payment.amount?.value)
      const paymentId = payment.id

      if (email && amount) {
        try {
          const response = await fetch(`${BASE_URL}/api/create-user-after-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              amount,
              payment_id: paymentId,
            }),
          })

          const result = await response.json()

          if (result.success) {
            console.log(`✅ Пользователь обработан: ${email}`)
          } else {
            console.error(`❌ Ошибка обработки пользователя: ${result.error}`)
          }
        } catch (err) {
          console.error("Ошибка вызова create-user-after-payment:", err)
        }
      } else {
        console.error("Отсутствует email или сумма в metadata")
      }
    }

    if (event === "payment.canceled") {
      console.log(`Платёж отменён: ${payment.id}`)
    }

    if (event === "payment.waiting_for_capture") {
      console.log(`Ожидается подтверждение платёжа: ${payment.id}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Ошибка обработки webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
