import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { payment_id } = await req.json();

  const secretKey = process.env.YOOMONEY_SECRET_KEY!;
  const encodedAuth = Buffer.from(`${process.env.YOOMONEY_SHOP_ID}:${secretKey}`).toString("base64");

  const res = await fetch(`https://api.yookassa.ru/v3/payments/${payment_id}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${encodedAuth}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ success: false, error: "Ошибка проверки платежа", details: data }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: data.status });
}
