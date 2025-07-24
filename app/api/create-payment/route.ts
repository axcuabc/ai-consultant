import { NextResponse } from "next/server";

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID || "твой_shop_id";
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY || "твой_секретный_ключ";

export async function POST(request: Request) {
  try {
    // В теле запроса не обязательно передавать сумму — она фиксирована
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email обязателен" }, { status: 400 });
    }

    // Генерируем уникальный ключ, чтобы платеж не повторялся
    const idempotenceKey = `payment_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Данные для платежа — сумма фиксирована 990 руб
    const paymentData = {
      amount: {
        value: "990", // строка с суммой в рублях
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/success`,
      },
      capture: true,
      description: "ИИ-Консультант для сайта - Полный пакет материалов",
      metadata: {
        email,
        product: "ai-consultant-package",
      },
    };

    // Создаём платёж через ЮKassa API
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString("base64")}`,
        "Idempotence-Key": idempotenceKey,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("ЮKassa API ошибка:", errorData);
      return NextResponse.json({ success: false, error: "Ошибка создания платежа в ЮKassa" }, { status: 500 });
    }

    const paymentResult = await response.json();

    // Возвращаем ссылку на страницу оплаты пользователю
    return NextResponse.json({
      success: true,
      paymentId: paymentResult.id,
      paymentUrl: paymentResult.confirmation.url,
      status: paymentResult.status,
    });
  } catch (error) {
    console.error("Ошибка сервера при создании платежа:", error);
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
