// ✅ Node.js API endpoint (работает без ошибок при билде)
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// 🧠 Создаём Supabase client с правами администратора
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔐 Генерация безопасного пароля
function generatePassword(length = 10) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  return Array.from({ length }, () => chars[crypto.randomInt(0, chars.length)]).join("");
}

// 📧 Отправка письма через Resend
async function sendPasswordEmail(email, password, amount) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("❌ RESEND_API_KEY отсутствует");
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
          <p style="color:#666;margin-top:20px;font-size:14px;">Пароль действителен 30 дней. После входа вы можете его изменить.</p>
        </div>`,
    }),
  });

  if (!res.ok) {
    console.error("❌ Ошибка отправки письма:", await res.text());
    return false;
  }

  console.log("✅ Письмо успешно отправлено:", email);
  return true;
}

// ⚙️ Основной endpoint
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Метод не разрешён" });
  }

  try {
    const { email, amount, payment_id } = req.body;

    if (!email || !amount) {
      return res.status(400).json({ success: false, error: "Email и сумма обязательны" });
    }

    const password = generatePassword();
    let userId = null;

    // Проверяем, существует ли пользователь
    const { data: userCheck } = await supabase.auth.admin.getUserByEmail(email);

    if (userCheck?.user) {
      // уже есть
      userId = userCheck.user.id;
      console.log("👤 Пользователь уже существует:", email);
    } else {
      // создаём нового
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createErr) {
        console.error("❌ Ошибка создания пользователя:", createErr);
        return res.status(500).json({ success: false, error: "Ошибка создания пользователя" });
      }

      userId = newUser.user.id;
      console.log("✅ Новый пользователь создан:", email);

      // Отправляем письмо
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
      console.error("❌ Ошибка сохранения покупки:", purchaseErr);
      return res.status(500).json({ success: false, error: "Ошибка сохранения покупки" });
    }

    return res.status(200).json({ success: true, user_id: userId });
  } catch (err) {
    console.error("❌ Ошибка сервера:", err);
    return res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  }
}
