import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Функция для генерации безопасного пароля
function generateSecurePassword(length = 10): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
  let password = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }

  return password
}

// Функция для отправки email
async function sendWelcomeEmail(email: string, password: string, amount: number) {
  // Здесь должна быть интеграция с email-сервисом (Resend, EmailJS и т.д.)
  console.log("Sending welcome email to:", email)
  console.log("Password:", password)
  console.log("Amount:", amount)

  // Временно возвращаем true
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email, amount, payment_id } = await request.json()

    if (!email || !amount) {
      return NextResponse.json({ success: false, error: "Email и сумма обязательны" }, { status: 400 })
    }

    // Генерируем безопасный пароль
    const password = generateSecurePassword(10)

    // Создаем пользователя в Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json({ success: false, error: "Ошибка создания пользователя" }, { status: 500 })
    }

    const userId = authUser.user.id

    // Создаем запись в таблице users
    const subscriptionEndDate = new Date()
    subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30) // +30 дней

    const { error: userError } = await supabase.from("users").insert([
      {
        id: userId,
        email: email,
        has_paid: true,
        subscription_ends_at: subscriptionEndDate.toISOString(),
      },
    ])

    if (userError) {
      console.error("Error creating user record:", userError)
      return NextResponse.json({ success: false, error: "Ошибка сохранения данных пользователя" }, { status: 500 })
    }

    // Создаем базового консультанта
    const { error: consultantError } = await supabase.from("consultants").insert([
      {
        user_id: userId,
        name: "Мой ИИ-консультант",
        prompt:
          "Ты профессиональный консультант. Отвечай вежливо, профессионально и по существу. Помогай клиентам с их вопросами и при необходимости предлагай записаться на личную консультацию.",
        theme_color: "#3B82F6",
        model: "deepseek-chat",
        temperature: 0.7,
      },
    ])

    if (consultantError) {
      console.error("Error creating consultant:", consultantError)
      // Не возвращаем ошибку, так как пользователь уже создан
    }

    // Сохраняем информацию о покупке в таблице purchases
    const { error: purchaseError } = await supabase.from("purchases").insert([
      {
        user_id: userId,
        email: email,
        item_name: "ИИ-Консультант - Первый месяц",
        amount: Number.parseFloat(amount.toString()),
        payment_id: payment_id || null,
        status: "completed",
      },
    ])

    if (purchaseError) {
      console.error("Error saving purchase:", purchaseError)
    }

    // Отправляем email с паролем
    const emailSent = await sendWelcomeEmail(email, password, amount)
    if (!emailSent) {
      console.warn("Failed to send welcome email")
    }

    return NextResponse.json({
      success: true,
      message: "Пользователь успешно создан",
      user_id: userId,
    })
  } catch (error) {
    console.error("Error in create-user-after-payment:", error)
    return NextResponse.json({ success: false, error: "Внутренняя ошибка сервера" }, { status: 500 })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
