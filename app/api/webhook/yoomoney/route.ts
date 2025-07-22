import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const YOOMONEY_SECRET_KEY = process.env.YOOMONEY_SECRET_KEY || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-yookassa-signature")

    // Проверяем подпись webhook (для безопасности)
    if (signature) {
      const expectedSignature = crypto.createHmac("sha256", YOOMONEY_SECRET_KEY).update(body).digest("hex")

      if (signature !== expectedSignature) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const webhookData = JSON.parse(body)
    const { event, object: payment } = webhookData

    console.log("Webhook received:", { event, paymentId: payment.id, status: payment.status })

    // Обрабатываем успешный платеж
    if (event === "payment.succeeded" && payment.status === "succeeded") {
      const email = payment.metadata?.email
      const amount = Number.parseFloat(payment.amount.value)
      const paymentId = payment.id

      if (email && amount) {
        // Вызываем функцию создания пользователя и сохранения покупки
        try {
          const response = await fetch(`${process.env.BASE_URL}/api/create-user-after-payment`, {
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
            console.log(`✅ User and purchase processed successfully: ${email}`)
          } else {
            console.error(`❌ Failed to process user/purchase: ${result.error}`)
          }
        } catch (error) {
          console.error("Error calling create-user-after-payment:", error)
        }
      } else {
        console.error("Missing email or amount in payment metadata")
      }
    }

    // Обрабатываем отмененный платеж
    if (event === "payment.canceled") {
      console.log(`Payment canceled: ${payment.id}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
