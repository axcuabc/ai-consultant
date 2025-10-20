// /api/send-access.js
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ success: false, error: "Email и сумма обязательны" });
    }

    // Инициализация Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

    // Генерация случайного пароля
    const password = Array.from({ length: 10 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"[crypto.randomInt(0, 70)]
    ).join("");

    // Проверка существующего пользователя
    const { data: userCheck } = await supabase.auth.admin.getUserByEmail(email);

    let userId;
    if (userCheck?.user) {
      userId = userCheck.user.id;
      console.log("👤 User already exists:", email);
    } else {
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createErr) {
        console.error("❌ Error creating user:", createErr);
        return res.status(500).json({ success: false, error: "Ошибка создания пользователя" });
      }

      userId = newUser.user.id;
      console.log("✅ New user created:", email);

      // Отправка письма с паролем
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "AI Консультант <no-reply@aiconsultant.com>",
          to: [email],
          subject: "Ваш доступ к платформе AI Консультант 🎉",
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
              <h2>🤖 Добро пожаловать в AI Консультант!</h2>
              <p>Ваш заказ на сумму <b>${amount}</b>₽ успешно оплачен.</p>
              <p>Ваши данные для входа:</p>
              <p><b>Email:</b> ${email}</p>
              <p><b>Пароль:</b> ${password}</p>
              <a href="${process.env.BASE_URL || "https://platform.aiconsultant.com"}/login"
                 style="background:#3B82F6;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
                 Войти в личный кабинет
              </a>
            </div>`,
        }),
      });
    }

    // Запись покупки
    const { error: purchaseErr } = await supabase.from("purchases").insert([
      {
        user_id: userId,
        email,
        amount: Number(amount),
        item_name: "ИИ-Консультант для сайта",
        status: "completed",
        created_at: new Date().toISOString(),
      },
    ]);

    if (purchaseErr) {
      console.error("❌ Purchase save error:", purchaseErr);
      return res.status(500).json({ success: false, error: "Ошибка сохранения покупки" });
    }

    return res.status(200).json({ success: true, user_id: userId });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
}
