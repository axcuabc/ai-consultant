export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"

// ✅ Инициализация Supabase Admin
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
)

// ✅ Генерация безопасного пароля
function generateSecurePassword(length = 10): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }
  return password
}

// ✅ Отправка письма через Resend
async function sendPasswordEmail(email: string, password: string, amount: number) {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "AI Консультант <no-reply@aiconsultant.com>"

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY не задан")
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [email],
        subject: "Ваш доступ к платформе AI Консультант 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto;">
            <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6);padding:25px;text-align:center;color:white;border-radius:8px 8px 0 0;">
              <h2>🤖 AI Консультант</h2>
              <p>Спасибо за оплату! Ваш личный кабинет готов</p>
            </div>
            <div style="background:white;padding:30px;border-radius:0 0 8px 8px;box-shadow:0 4px 10px rgba(0,0,0,0.05);">
              <h3>🔐 Данные для входа:</h3>
              <p><b>Email:</b> ${email}</p>
              <p><b>Пароль:</b> <code>${password}</code></p>
              <p>Срок действия подписки: 30 дней.</p>
              <div style="margin:30px 0;text-align:center;">
                <a href="${process.env.BASE_URL || "https://platform.aiconsultant.com"}/login"
                   style="background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
                  Войти в кабинет
                </a>
              </div>
              <hr/>
              <p style="font-size:12px;color:#666;">Если письмо пришло по ошибке — просто проигнорируйте его.</p>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      console.error("❌ Ошибка при отправке письма:", await response.text())
      return false
    }

    console.log("✅ Письмо успешно отправлено:", email)
    return true
  } catch (err) {
    console.error("❌ Ошибка Resend:", err)
    return false
  }
}

// ✅ Основной API-обработчик
export async function POST(request: NextRequest) {
  try {
    const { email, amount, payment_id } = await request.json()

    if (!email || !amount) {
      return NextResponse.json({ success: false, error: "Email и сумма обязательны" }, { status: 400 })
    }

    // Генерируем пароль
    const password = generateSecurePassword()

    // Проверяем пользователя
    const { data: existing, error: existingError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    if (existingError) console.warn("⚠️ Ошибка при поиске пользователя:", existingError)

    let userId: string

    if (existing?.user) {
      userId = existing.user.id
      console.log("Пользователь уже существует:", email)
    } else {
      // Создаём нового пользователя
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (createError || !newUser?.user) {
        console.error("❌ Ошибка создания пользователя:", createError)
        return NextResponse.json({ success: false, error: "Ошибка создания пользователя" }, { status: 500 })
      }
      userId = newUser.user.id
      console.log("✅ Новый пользователь создан:", email)

      // Отправляем письмо с паролем
      await sendPasswordEmail(email, password, amount)
    }

    // Записываем покупку
    const { error: insertError } = await supabaseAdmin.from("purchases").insert([
      {
        user_id: userId,
        email,
        amount: Number(amount),
        item_name: "ИИ-Консультант для сайта - Полный пакет",
        payment_id: payment_id || null,
        status: "completed",
        created_at: new Date().toISOString(),
      },
    ])

    if (insertError) {
      console.error("❌ Ошибка при записи покупки:", insertError)
      return NextResponse.json({ success: false, error: "Ошибка сохранения покупки" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Пользователь успешно создан и покупка сохранена",
      user_id: userId,
      new_user: !existing?.user,
    })
  } catch (error) {
    console.error("❌ Ошибка create-user-after-payment:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}
