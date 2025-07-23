import { NextRequest, NextResponse } from "next/server"

const HUGGING_FACE_API_URL =
  "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1"
const HUGGING_FACE_API_TOKEN = "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"

async function queryHuggingFace(prompt: string): Promise<string> {
  try {
    const response = await fetch(HUGGING_FACE_API_URL, {
      headers: {
        Authorization: `Bearer ${HUGGING_FACE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 300,
          temperature: 0.7,
        },
      }),
    })

    if (!response.ok) {
      console.error(`Hugging Face API error: ${response.status} ${response.statusText}`)
      return ""
    }

    const result = await response.json()

    if (typeof result === "string") {
      return result
    }

    if (result?.generated_text) {
      return result.generated_text
    }

    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text
    }

    console.log("Hugging Face unexpected result:", result)
    return ""
  } catch (err) {
    console.error("Hugging Face fetch error:", err)
    return ""
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, chatHistory = [] } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({
        response: "Пожалуйста, напишите ваш вопрос!",
      })
    }

    const systemPrompt = `Ты дружелюбный и полезный AI-консультант, который помогает людям подключать ИИ на сайты.
Отвечай кратко, ясно и по делу, как профессионал. Всегда говори на русском языке.

Вот что получает пользователь после оплаты:

1. HTML-код — фрагмент для вставки ИИ на сайт
2. PDF-руководство — пошаговая инструкция по настройке
3. Библиотека промптов — готовые фразы для разных ниш
4. Видео-инструкция — разбор всего процесса
5. Шаблоны сообщений чат-бота — как настроить ответы

Если пользователь спрашивает “что я получу” — перечисли эти пункты.`

    const historyText = chatHistory
      .slice(-3)
      .map((msg: any) => `${msg.isUser ? "Пользователь" : "Консультант"}: ${msg.text}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\n${historyText}\nПользователь: ${message}\nКонсультант:`

    const aiResponse = await queryHuggingFace(fullPrompt)

    if (aiResponse && aiResponse.trim().length > 5) {
      return NextResponse.json({ response: aiResponse.trim() })
    }

    // Если модель не ответила — вернуть универсальное сообщение об ошибке
    return NextResponse.json({
      response: "Извините, я временно не могу ответить. Попробуйте повторить позже.",
    })
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({
      response: "Извините, произошла ошибка. Пожалуйста, попробуйте позже.",
    })
  }
}
