export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// 💾 Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 🔐 Генерация безопасного пароля
function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length }, () => chars[crypto.randomInt(0, chars.length)]).join("");
}

// 📧 Отправка письма через Resend
async function sendPasswordEmail(email, password, amount) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is missing");
    return false;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "AI Консультант <no-reply@aiconsultant.com>",
      to: [email],
      subject: "Ваш доступ к платформе AI Консультант 🎉",
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#111;">🤖 Добро пожаловать в AI Консультант!</h2>
          <p>Ваш заказ на сумму <b>${amount}</b>₽ успешно оплачен.</p>
          <p>Ваши данные для входа:</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Пароль:</b> ${password}</p>
          <a href="${process.env.BASE_URL || "https://platform.aiconsultant.com"}/login"
             style="background:#3B82F6;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
             Войти в личный кабинет
          </a>
        </div>`,
    }),
  });

  if (!res.ok) {
    console.error("❌ Email send failed:", await res.text());
    return false;
  }

  console.log("✅ Email sent to", email);
  return true;
}

// 🧠 Основной API endpoint
export async function POST(req) {
  try {
    const { email, amount, payment_id } = await req.json();

    if (!email || !amount) {
      return NextResponse.json({ success: false, error: "Email и сумма обязательны" }, { status: 400 });
    }

    const password = generatePassword();
    let userId = null;

    // Проверяем существующего пользователя
    const { data: userCheck } = await supabase.auth.admin.getUserByEmail(email);
    if (userCheck?.user) {
      userId = userCheck.user.id;
    } else {
      // Создаём нового
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr) {
        console.error("❌ Create user error:", createErr);
        return NextResponse.json({ success: false, error: "Ошибка создания пользователя" }, { status: 500 });
      }
      userId = newUser.user.id;
      await sendPasswordEmail(email, password, amount);
    }

    // Сохраняем покупку
    const { error: purchaseErr } = await supabase.from("purchases").insert([
      {
        user_id: userId,
        email,
        amount: Number(amount),
        item_name: "ИИ-Консультант для сайта - Полный пакет",
        payment_id: payment_id || null,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    ]);
    if (purchaseErr) {
      console.error("❌ Purchase save error:", purchaseErr);
      return NextResponse.json({ success: false, error: "Ошибка сохранения покупки" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user_id: userId });
  } catch (err) {
    console.error("❌ Server error:", err);
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
