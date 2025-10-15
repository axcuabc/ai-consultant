import { type NextRequest, NextResponse } from "next/server"

// Твой API-ключ OpenRouter (лучше хранить в .env.local)
const OPENROUTER_API_KEY = "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"

// URL OpenRouter
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Запасные ответы
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

// Функция для релевантных ответов по ключевым словам (оставь без изменений)
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

  if (lowerMessage.includes("привет") || lowerMessage.includes("здравствуй") || lowerMessage.includes("добро")) {
    return "Привет! Я ваш ИИ-консультант. Помогу с любыми вопросами о настройке искусственного интеллекта на сайты. О чем хотите узнать?"
  }

  if (lowerMessage.includes("спасибо") || lowerMessage.includes("благодар")) {
    return "Пожалуйста! Рад помочь. Если есть еще вопросы - обращайтесь. Готов ответить на всё о настройке ИИ-консультантов!"
  }

  // Возвращаем случайный ответ если не нашли ключевых слов
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

async function queryOpenRouter(prompt: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.log("OpenRouter API key not configured, using fallback responses")
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 секунд таймаут

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-consultant-six.vercel.app",
        "X-Title": "AI-Consultant",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Ты профессиональный консультант по ИИ-решениям для сайтов. 
            Отвечай кратко, дружелюбно и по существу на русском языке.
            Помогаешь с вопросами о настройке ИИ-консультантов на сайты.
            Стоимость продукта: 990 рублей за полный пакет.
            Включает: HTML код, PDF инструкции, видео-гайд, библиотеку промптов, поддержку.
            Работает на всех платформах: Tilda, WordPress, Wix и других.
            Отвечай максимум в 2-3 предложения.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`OpenRouter API returned status: ${response.status}`)
      const errorText = await response.text()
      console.log("OpenRouter error response:", errorText)
      return null
    }

    const data = await response.json()

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim()
    }

    console.log("No valid response from OpenRouter:", data)
    return null
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("OpenRouter request timed out")
    } else {
      console.error("OpenRouter API Error:", error)
    }
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, chatHistory = [] } = body

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({
        response: "Пожалуйста, напишите ваш вопрос!",
      })
    }

    const trimmedMessage = message.trim()

    // Сперва пробуем использовать OpenRouter (нейросеть)
    const aiResponse = await queryOpenRouter(trimmedMessage)

    // Если ответ получен от нейросети и он достаточно содержательный — используем его
    if (aiResponse && aiResponse.length > 20) {
      return NextResponse.json({ response: aiResponse })
    }

    // Если нейросеть не ответила — пробуем релевантный шаблон
    const keywordResponse = getRelevantResponse(trimmedMessage)
    return NextResponse.json({ response: keywordResponse })
  } catch (error) {
    console.error("API Route Error:", error)

    const fallbackResponse = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({ response: fallbackResponse })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
