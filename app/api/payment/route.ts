import { NextResponse } from "next/server";
import { Buffer } from "buffer";

export async function POST() {
  try {
    const secretKey = process.env.YOOMONEY_SECRET_KEY!;
    const encodedAuth = Buffer.from(`${secretKey}:`).toString("base64");

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedAuth}`,
        "Idempotence-Key": `payment-${Date.now()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          value: "20.00",
          currency: "RUB",
        },
        confirmation: {
          type: "redirect",
          return_url: "https://ai-consultant-six.vercel.app/payment/success"

        },
        capture: true,
        description: "Покупка AI-доступа",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Ошибка при чтении ответа" }));
      console.error("ЮKassa API ошибка:", errorData);
      return NextResponse.json(
        { success: false, error: "Ошибка создания платежа в ЮKassa", details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, payment: data });
  } catch (err) {
    console.error("Ошибка в POST обработчике:", err);
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
