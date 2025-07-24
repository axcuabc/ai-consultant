import { type NextRequest, NextResponse } from "next/server"

const YOOMONEY_SHOP_ID = process.env.YOOMONEY_SHOP_ID || "your-shop-id"
const YOOMONEY_SECRET_KEY = process.env.YOOMONEY_SECRET_KEY || "your-secret-key"
const YOOMONEY_API_URL = "https://api.yookassa.ru/v3/payments"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("payment_id")

    if (!paymentId) {
      return NextResponse.json({ success: false, error: "Payment ID is required" }, { status: 400 })
    }

    const response = await fetch(`${YOOMONEY_API_URL}/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${YOOMONEY_SHOP_ID}:${YOOMONEY_SECRET_KEY}`).toString("base64")}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Ошибка проверки платежа:", errorData)
      return NextResponse.json({ success: false, error: "Failed to check payment status" }, { status: 500 })
    }

    const paymentData = await response.json()

    return NextResponse.json({
      success: true,
      status: paymentData.status,
      amount: paymentData.amount,
      description: paymentData.description,
      metadata: paymentData.metadata,
    })
  } catch (error) {
    console.error("Ошибка проверки платежа:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
