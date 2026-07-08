import crypto from "crypto";

export async function POST(req) {
  try {
    const { amount, description, email } = await req.json();

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    if (!shopId || !secretKey) {
      return Response.json(
        { success: false, error: "ЮKassa не настроена" },
        { status: 500 }
      );
    }

    const idempotenceKey = crypto.randomUUID();

    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        Authorization:
          "Basic " +
          Buffer.from(`${shopId}:${secretKey}`).toString("base64"),
      },
      body: JSON.stringify({
        amount: { value: amount || 4000, currency: "RUB" },
        confirmation: {
          type: "redirect",
          return_url: "https://ai-consultant-platform.vercel.app/payment/success",
        },
        capture: true,
        description:
          description || "Оплата доступа к платформе AI Consultant",
        metadata: { email },
      }),
    });

    const data = await response.json();

    if (response.ok && data?.confirmation?.confirmation_url) {
      return Response.json({
        success: true,
        paymentUrl: data.confirmation.confirmation_url,
      });
    } else {
      console.error("Ошибка ЮKassa:", data);
      return Response.json(
        { success: false, error: data.description || "Ошибка ЮKassa" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Ошибка при создании платежа:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
