import { type NextRequest, NextResponse } from "next/server"

// Конфигурация ЮMoney
const YOOMONEY_SHOP_ID = process.env.YOOMONEY_SHOP_ID || "your-shop-id"
const YOOMONEY_SECRET_KEY = process.env.YOOMONEY_SECRET_KEY || "your-secret-key"
const YOOMONEY_API_URL = "https://api.yookassa.ru/v3/payments"

export async function POST(request: NextRequest) {
  try {
    const { amount, description, email } = await request.json()

    if (!amount || !description || !email) {
      return NextResponse.json({ success: false, error: "Отсутствуют обязательные параметры" }, { status: 400 })
    }

    // Генерируем уникальный идентификатор платежа
    const idempotenceKey = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Данные для создания платежа
    const paymentData = {
      amount: {
        value: amount.toString(),
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success`,
      },
      capture: true,
      description: description,
      metadata: {
        email: email,
        product: "ai-consultant-package",
      },
    }

    // Создаем платеж через API ЮKassa
    const response = await fetch(YOOMONEY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${YOOMONEY_SHOP_ID}:${YOOMONEY_SECRET_KEY}`).toString("base64")}`,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify(paymentData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("ЮKassa API Error:", errorData)
      return NextResponse.json({ success: false, error: "Ошибка создания платежа в ЮKassa" }, { status: 500 })
    }

    const paymentResult = await response.json()

    // Сохраняем информацию о платеже (в реальном проекте - в базу данных)
    // Здесь можно добавить логику сохранения в БД
    console.log("Payment created:", {
      paymentId: paymentResult.id,
      email: email,
      amount: amount,
      status: paymentResult.status,
    })

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.id,
      paymentUrl: paymentResult.confirmation.confirmation_url,
      status: paymentResult.status,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force_dynamic"
