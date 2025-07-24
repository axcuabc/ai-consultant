import { NextRequest, NextResponse } from "next/server";
import { Buffer } from "buffer";

const YOOKASSA_SHOP_ID = process.env.YOOMONEY_SHOP_ID || "";
const YOOKASSA_SECRET_KEY = process.env.YOOMONEY_SECRET_KEY || "";
const YOOKASSA_API_URL = "https://api.yookassa.ru/v3/payments";

export async function POST(request: NextRequest) {
  try {
    const { description, email } = await request.json();

    if (!description || !email) {
      return NextResponse.json(
        { success: false, error: "Отсутствуют обязательные параметры" },
        { status: 400 }
      );
    }

    const amount = 990; // Фиксированная сумма в рублях

    // Создаем уникальный ключ идемпотентности
    const idempotenceKey = `payment_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

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
      description,
      metadata: {
        email,
        product: "ai-consultant-package",
      },
    };

    const response = await fetch(YOOKASSA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`
        ).toString("base64")}`,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ЮKassa API Error:", errorData);
      return NextResponse.json(
        { success: false, error: "Ошибка создания платежа в ЮKassa" },
        { status: 500 }
      );
    }

    const paymentResult = await response.json();

    console.log("Платеж создан:", {
      paymentId: paymentResult.id,
      email,
      amount,
      status: paymentResult.status,
    });

    return NextResponse.json({
      success: true,
      paymentId: paymentResult.id,
      paymentUrl: paymentResult.confirmation.url,
      status: paymentResult.status,
    });
  } catch (error) {
    console.error("Ошибка сервера:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
