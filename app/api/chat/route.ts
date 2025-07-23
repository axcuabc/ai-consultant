import { NextRequest, NextResponse } from "next/server"

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"
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
      }),
    })

    const result = await response.json()
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text
    }

    return ""
  } catch (err) {
    console.error("Hugging Face error:", err)
    return ""
  }
}

const FALLBACK_RESPONSES = [
  "Извините, не удалось понять ваш вопрос. Попробуйте переформулировать.",
  "Пожалуйста, уточните, что именно вы хотите подключить.",
  "Если вы хотите установить ИИ на сайт, нажмите кнопку 'Купить доступ'.",
]

function getRelevantResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("оплата") || lower.includes("купить")) {
    return "Чтобы получить доступ к ИИ-консультанту, пожалуйста, оформите покупку через форму оплаты."
  }
  if (lower.includes("вход") || lower.includes("логин")) {
    return "Для входа используйте данные, которые вы указали при покупке доступа."
  }
  if (lower.includes("как подключить") || lower.includes("код вставить")) {
    return "После покупки вы получите код для вставки на ваш сайт."
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

    const systemPrompt = `Ты профессиональный консультант по ИИ-решениям для сайтов. 
Отвечай кратко, дружелюбно и по существу на русском языке.
Помогаешь с вопросами о настройке ИИ-консультантов на сайты.`

    const historyText = chatHistory
      .slice(-3)
      .map((msg: any) => `${msg.isUser ? "Пользователь" : "Консультант"}: ${msg.text}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\n${historyText}\nПользователь: ${message}\nКонсультант:`

    const aiResponse = await queryHuggingFace(fullPrompt)

    if (aiResponse && aiResponse.length > 10) {
      return NextResponse.json({ response: aiResponse })
    }

    const fallbackResponse = getRelevantResponse(message)

    return NextResponse.json({ response: fallbackResponse })
  } catch (error) {
    console.error("API Route Error:", error)

    const fallbackResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({ response: fallbackResponse })
  }
}
