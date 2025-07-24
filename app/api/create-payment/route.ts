import { type NextRequest, NextResponse } from "next/server"

const YOOMONEY_SHOP_ID = process.env.YOOMONEY_SHOP_ID
const YOOMONEY_SECRET_KEY = process.env.YOOMONEY_SECRET_KEY
const YOOMONEY_API_URL = "https://api.yookassa.ru/v3/payments"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || ""

    if (!contentType.includes("application/json")) {
      return NextResponse.json({ success: false, error: "Неверный формат запроса. Ожидается JSON." }, { status: 400 })
    }

    const { amount, description, email } = await request.json()

    if (!amount || !description || !email) {
      return NextResponse.json({ success: false, error: "Отсутствуют обязательные параметры" }, { status: 400 })
    }

    if (!YOOMONEY_SHOP_ID || !YOOMONEY_SECRET_KEY) {
      return NextResponse.json({ success: false, error: "ЮKassa не настроена" }, { status: 500 })
    }

    const idempotenceKey = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    const paymentData = {
      amount: {
        value: amount.toString(),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
      },
      capture: true,
      description,
      metadata: {
        email,
        product: "ai-consultant-package",
      },
    }

    const response = await fetch(YOOMONEY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${YOOMONEY_SHOP_ID}:${YOOMONEY_SECRET_KEY}`).toString("base64")}`,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify(paymentData),
    })

    const paymentResult = await response.json()

    if (!response.ok) {
      console.error("ЮKassa API Error:", paymentResult)
      return NextResponse.json({ success: false, error: "Ошибка создания платежа в ЮKassa" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.id,
      paymentUrl: paymentResult.confirmation.confirmation_url,
      status: paymentResult.status,
    })
  } catch (error) {
    console.error("Ошибка при создании платежа:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
