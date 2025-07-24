import { NextResponse } from "next/server";

export async function POST() {
  const shopId = process.env.YOOMONEY_SHOP_ID!;
  const secretKey = process.env.YOOMONEY_SECRET_KEY!;

  const authString = `${shopId}:${secretKey}`;
  const encodedAuth = Buffer.from(authString).toString("base64");

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${encodedAuth}`,
      "Idempotence-Key": `payment-${Date.now()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: {
        value: "990.00",
        currency: "RUB",
      },
      confirmation: {
        type: "redirect",
        return_url: "https://ai-consultant-six.vercel.app/success",
      },
      capture: true,
      description: "Покупка AI-доступа",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("ЮKassa API ошибка:", errorData);
    return NextResponse.json({ success: false, error: "Ошибка создания платежа в ЮKassa" }, { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json({ success: true, payment: data });
}
