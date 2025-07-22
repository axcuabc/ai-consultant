import { type NextRequest, NextResponse } from "next/server"

const HF_TOKEN = "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"

// Используем более надежную модель для русского языка
const HF_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-large"

// Запасные ответы по теме ИИ-консультантов
const FALLBACK_RESPONSES = [
  "Отличный вопрос! Наш ИИ-консультант легко интегрируется на любой сайт. Просто скопируйте код и вставьте его перед закрывающим тегом </body>.",
  "Да, это работает на всех популярных платформах: Tilda, WordPress, Wix, Squarespace. Настройка займет всего 5-10 минут!",
  "Стоимость составляет 990 рублей за полный пакет. Это разовая оплата, никаких ежемесячных платежей.",
  "У нас есть подробная видео-инструкция и PDF-гайд с пошаговыми скриншотами. Даже без навыков программирования вы легко справитесь!",
  "ИИ-консультант работает 24/7, отвечает на вопросы клиентов, может записывать на консультации и рассказывать о ваших услугах.",
  "Можно полностью настроить под ваш бренд - цвета, шрифты, стиль сообщений. Все инструкции включены в пакет.",
  "Для работы вам понадобится только API-ключ OpenAI. Обычно это стоит 300-1500₽ в месяц в зависимости от количества сообщений.",
  "Консультант может работать на русском, английском и других языках. Настраивается через промпты.",
  "Да, можно добавить на несколько сайтов. Код универсальный и работает везде.",
  "Поддержка включена! Поможем с настройкой через Telegram или email в течение 30 дней после покупки.",
]

// Функция для получения релевантного ответа на основе ключевых слов
function getRelevantResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("цена") || lowerMessage.includes("стоимость") || lowerMessage.includes("сколько")) {
    return "Стоимость составляет 990 рублей за полный пакет. Это разовая оплата, никаких ежемесячных платежей. Вы получаете код, инструкции, видео и поддержку."
  }

  if (lowerMessage.includes("tilda") || lowerMessage.includes("wordpress") || lowerMessage.includes("сайт")) {
    return "Да, наш код работает на всех популярных платформах: Tilda, WordPress, Wix, Squarespace и обычных HTML сайтах. Просто вставьте код - и всё готово!"
  }

  if (lowerMessage.includes("настрой") || lowerMessage.includes("установ") || lowerMessage.includes("как")) {
    return "Настройка очень простая! Скопируйте наш HTML-код и вставьте его на сайт перед закрывающим тегом </body>. У нас есть подробная видео-инструкция и PDF-гайд."
  }

  if (lowerMessage.includes("программирован") || lowerMessage.includes("код") || lowerMessage.includes("сложно")) {
    return "Никаких навыков программирования не нужно! Если умеете копировать и вставлять текст - справитесь легко. Всё объяснено пошагово с картинками."
  }

  if (lowerMessage.includes("работа") || lowerMessage.includes("функци") || lowerMessage.includes("возможност")) {
    return "ИИ-консультант работает 24/7, отвечает на вопросы клиентов, может записывать на консультации, рассказывать о ваших услугах. Полностью настраивается под ваш бизнес."
  }

  if (lowerMessage.includes("дизайн") || lowerMessage.includes("внешний вид") || lowerMessage.includes("цвет")) {
    return "Да, можно полностью кастомизировать! Меняйте цвета, шрифты, расположение под ваш бренд. В пакете есть готовые стили и инструкции по настройке."
  }

  if (lowerMessage.includes("поддержка") || lowerMessage.includes("помощь") || lowerMessage.includes("вопрос")) {
    return "Конечно поможем! Поддержка включена в стоимость. Обращайтесь в Telegram или на email - ответим быстро и поможем с любыми вопросами."
  }

  // Возвращаем случайный ответ если не нашли ключевых слов
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

async function queryHuggingFace(prompt: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 секунд таймаут

    const response = await fetch(HF_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 100,
          temperature: 0.7,
          do_sample: true,
          pad_token_id: 50256,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Если модель загружается (503), ждем и пробуем еще раз
    if (response.status === 503) {
      const result = await response.json()
      if (result.estimated_time) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(result.estimated_time * 1000, 10000)))
        return queryHuggingFace(prompt) // Повторный запрос
      }
    }

    if (!response.ok) {
      console.log(`HF API returned status: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (Array.isArray(data) && data[0]?.generated_text) {
      let generatedText = data[0].generated_text

      // Извлекаем только ответ консультанта
      const consultantIndex = generatedText.lastIndexOf("Консультант:")
      if (consultantIndex !== -1) {
        generatedText = generatedText.substring(consultantIndex + "Консультант:".length).trim()
      }

      // Ограничиваем длину ответа
      if (generatedText.length > 300) {
        generatedText = generatedText.substring(0, 300) + "..."
      }

      return generatedText || null
    }

    return null
  } catch (error) {
    console.error("HF API Error:", error)
    return null
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

    // Сначала пробуем получить релевантный ответ на основе ключевых слов
    const keywordResponse = getRelevantResponse(message)

    // Если это не общий ответ, возвращаем его
    if (!FALLBACK_RESPONSES.includes(keywordResponse)) {
      return NextResponse.json({ response: keywordResponse })
    }

    // Пробуем использовать Hugging Face для более сложных вопросов
    const systemPrompt = `Ты профессиональный консультант по ИИ-решениям для сайтов. 
    Отвечай кратко, дружелюбно и по существу на русском языке.
    Помогаешь с вопросами о настройке ИИ-консультантов на сайты.`

    const historyText = chatHistory
      .slice(-3) // Берем только последние 3 сообщения
      .map((msg: any) => `${msg.isUser ? "Пользователь" : "Консультант"}: ${msg.text}`)
      .join("\n")

    const fullPrompt = `${systemPrompt}\n\n${historyText}\nПользователь: ${message}\nКонсультант:`

    const aiResponse = await queryHuggingFace(fullPrompt)

    // Если AI ответил, используем его ответ, иначе - заготовленный
    const finalResponse = aiResponse && aiResponse.length > 10 ? aiResponse : keywordResponse

    return NextResponse.json({ response: finalResponse })
  } catch (error) {
    console.error("API Route Error:", error)

    // В случае любой ошибки возвращаем случайный заготовленный ответ
    const fallbackResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({ response: fallbackResponse })
  }
}

// Экспортируем конфигурацию для Vercel
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

