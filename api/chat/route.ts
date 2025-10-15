import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

export async function POST(request: NextRequest) {
  try {
    const { userId, message, consultantId } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Получаем данные консультанта
    const { data: consultant, error } = await supabase
      .from("consultants")
      .select("*")
      .eq(consultantId ? "id" : "user_id", consultantId || userId)
      .single()

    if (error || !consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    // Проверяем, есть ли API ключ OpenRouter
    if (!OPENROUTER_API_KEY) {
      // Fallback ответы для демо
      const demoResponses = [
        "Спасибо за ваш вопрос! Я готов помочь вам разобраться с этой темой.",
        "Это интересный вопрос. Расскажите мне больше деталей, чтобы я мог дать более точный совет.",
        "На основе вашего запроса могу предложить несколько вариантов решения. Хотели бы обсудить их подробнее?",
      ]

      const response = demoResponses[Math.floor(Math.random() * demoResponses.length)]

      return NextResponse.json({
        response,
        isDemo: true,
      })
    }

    // Делаем запрос к OpenRouter API
    const openrouterResponse = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        "X-Title": "AI Consultant",
      },
      body: JSON.stringify({
        model: consultant.model || "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: consultant.prompt },
          { role: "user", content: message },
        ],
        temperature: consultant.temperature || 0.7,
        max_tokens: 500,
      }),
    })

    if (!openrouterResponse.ok) {
      throw new Error(`OpenRouter API error: ${openrouterResponse.status}`)
    }

    const data = await openrouterResponse.json()
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error("No response from AI")
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Chat API Error:", error)

    // Fallback response
    const fallbackResponse =
      "Извините, произошла техническая ошибка. Попробуйте повторить запрос через несколько секунд."

    return NextResponse.json({
      response: fallbackResponse,
      error: true,
    })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
