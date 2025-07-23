import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import crypto from "crypto"

// Функция для генерации безопасного пароля
function generateSecurePassword(length = 10): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }

  return password
}

// Функция для отправки email через Resend
async function sendPasswordEmail(email: string, password: string, amount: number) {
  const emailApiKey = process.env.EMAIL_API_KEY
  const emailFrom = process.env.EMAIL_FROM || "noreply@yourdomain.com"

  if (!emailApiKey) {
    console.error("EMAIL_API_KEY not configured")
    return false
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${emailApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [email],
        subject: "Ваши материалы ИИ-Консультант готовы! 🎉",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">🤖 ИИ-Консультант</h1>
              <p style="color: #E0E7FF; margin: 10px 0 0 0;">Спасибо за покупку!</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1F2937; margin-bottom: 20px;">Ваш заказ успешно оплачен!</h2>
              
              <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;"><strong>Сумма:</strong> ${amount.toLocaleString("ru-RU")} ₽</p>
                <p style="margin: 10px 0 0 0; color: #374151;"><strong>Товар:</strong> ИИ-Консультант для сайта - Полный пакет</p>
              </div>

              <h3 style="color: #1F2937; margin: 30px 0 15px 0;">🔐 Данные для входа в личный кабинет:</h3>
              <div style="background: #EFF6FF; border: 1px solid #DBEAFE; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 0; color: #1E40AF;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 10px 0 0 0; color: #1E40AF;"><strong>Пароль:</strong> <code style="background: #FEF3C7; padding: 2px 6px; border-radius: 4px; color: #92400E;">${password}</code></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL}/auth" 
                   style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Войти в личный кабинет
                </a>
              </div>

              <h3 style="color: #1F2937; margin: 30px 0 15px 0;">📦 Что вы получили:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>✅ HTML код для интеграции ИИ-консультанта</li>
                <li>✅ PDF руководство с пошаговыми инструкциями</li>
                <li>✅ Видео-инструкция по настройке</li>
                <li>✅ Библиотека готовых промптов для разных ниш</li>
                <li>✅ Бонусные шаблоны стилизации</li>
                <li>✅ 30 дней технической поддержки</li>
              </ul>

              <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #166534;"><strong>💡 Совет:</strong> Сохраните этот пароль в надежном месте. Вы сможете изменить его в личном кабинете.</p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                <p style="color: #6B7280; font-size: 14px; margin: 0;">
                  Нужна помощь? Напишите нам: <a href="mailto:support@yourdomain.com" style="color: #3B82F6;">support@yourdomain.com</a>
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Email sending failed:", errorData)
      return false
    }

    console.log("Password email sent successfully to:", email)
    return true
  } catch (error) {
    console.error("Error sending email:", error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, amount, payment_id } = await request.json()

    if (!email || !amount) {
      return NextResponse.json({ success: false, error: "Email и сумма обязательны" }, { status: 400 })
    }

    // Генерируем безопасный пароль
    const password = generateSecurePassword(10)

    // Проверяем, существует ли пользователь
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(email)

    let userId: string

    if (existingUser.user) {
      // Пользователь уже существует
      userId = existingUser.user.id
      console.log("User already exists:", email)
    } else {
      // Создаем нового пользователя
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Автоматически подтверждаем email
      })

      if (createError) {
        console.error("Error creating user:", createError)
        return NextResponse.json({ success: false, error: "Ошибка создания пользователя" }, { status: 500 })
      }

      userId = newUser.user.id
      console.log("New user created:", email)
    }

    // Сохраняем информацию о покупке
    const { error: purchaseError } = await supabaseAdmin.from("purchases").insert([
      {
        user_id: userId,
        email: email,
        item_name: "ИИ-Консультант для сайта - Полный пакет",
        amount: Number.parseFloat(amount.toString()),
        payment_id: payment_id || null,
        status: "completed",
      },
    ])

    if (purchaseError) {
      console.error("Error saving purchase:", purchaseError)
      return NextResponse.json({ success: false, error: "Ошибка сохранения покупки" }, { status: 500 })
    }

    // Отправляем email с паролем (только для новых пользователей)
    if (!existingUser.user) {
      const emailSent = await sendPasswordEmail(email, password, amount)
      if (!emailSent) {
        console.warn("Failed to send password email, but user and purchase created")
      }
    }

    return NextResponse.json({
      success: true,
      message: "Пользователь создан и покупка сохранена",
      user_id: userId,
      new_user: !existingUser.user,
    })
  } catch (error) {
    console.error("Error in create-user-after-payment:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force_dynamic"
