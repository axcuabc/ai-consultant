import { NextRequest, NextResponse } from "next/server"

const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
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
    return `После оплаты вы получите:
- Готовый HTML-код для вставки на сайт
- PDF-руководство по установке с пошаговыми инструкциями и скриншотами
- Библиотеку промптов для настройки поведения ИИ
- Видеоинструкции по всем этапам
- Готовые шаблоны сообщений чат-бота и варианты стилизации

Оформите покупку, чтобы получить всё это.`
  }
  if (lower.includes("вход") || lower.includes("логин")) {
    return "Для входа используйте email, который вы указали при оплате. Сразу после оплаты доступ приходит автоматически."
  }
  if (lower.includes("подключить") || lower.includes("код вставить")) {
    return "Вы получите готовый код и подробное руководство, как вставить его на сайт. Это займёт всего пару минут!"
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

    const systemPrompt = `
Ты — вежливый, краткий и дружелюбный ИИ-консультант. 
Твоя задача — отвечать пользователю на русском языке и побуждать к покупке доступа к ИИ-консультанту для сайтов.
Если пользователь интересуется, что он получит, объясни это.
Если он не понимает, как подключить — скажи, что получит PDF-инструкцию, код, видео, шаблоны.
Не пиши слишком подробно, подталкивай к покупке, а не к самостоятельной реализации.`

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
