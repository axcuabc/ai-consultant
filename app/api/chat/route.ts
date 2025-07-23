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

const FALLBACK_RESPONSES = [
  "Извините, не удалось понять ваш вопрос. Попробуйте переформулировать.",
  "Пожалуйста, уточните, что именно вы хотите узнать.",
  "Если вы хотите установить ИИ на сайт, нажмите кнопку 'Купить доступ'.",
]

function getRelevantResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("оплата") || lower.includes("купить")) {
    return "Чтобы получить доступ к ИИ-консультанту, пожалуйста, оформите покупку через форму оплаты."
  }
  if (lower.includes("вход") || lower.includes("логин")) {
    return "Для входа используйте email, который вы указали при оплате. Сразу после оплаты доступ приходит автоматически."
  }
  if (lower.includes("что я получу") || lower.includes("после оплаты")) {
    return `После оплаты вы получите:

1. HTML-код для вставки ИИ на сайт
2. PDF-инструкцию по настройке
3. Готовые промпты и шаблоны сообщений
4. Видео-объяснение по установке

Это полный комплект для интеграции ИИ на ваш сайт.`
  }
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
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

    const fallbackResponse = getRelevantResponse(message)

    return NextResponse.json({ response: fallbackResponse })
  } catch (error) {
    console.error("API Route Error:", error)

    const fallbackResponse =
      FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({ response: fallbackResponse })
  }
}
