import { modelFields } from "@/lib/models"
import { type NextRequest, NextResponse } from "next/server"
import { PLAN, formatRub } from "@/lib/plans"

// Ключ OpenRouter берётся из переменных окружения (Vercel → Settings → Environment Variables)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

// URL OpenRouter
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Запасные ответы
const FALLBACK_RESPONSES = [
  "Отличный вопрос! Наш ИИ-консультант легко интегрируется на любой сайт. Просто скопируйте код и вставьте его перед закрывающим тегом </body>.",
  "Да, это работает на Tilda (блок T123, нужен платный тариф Tilda), на своём сайте и в любом конструкторе, где можно вставить HTML-код. Настройка занимает 5–10 минут.",
  `Это подписка: ${formatRub(PLAN.startPrice)} за подключение и первые ${PLAN.periodDays} дней, дальше ${formatRub(PLAN.renewPrice)} за каждые ${PLAN.periodDays} дней. Ответы ИИ уже включены в цену.`,
  "Всё настраивается в кабинете: выбираете нишу, заполняете данные о бизнесе, настраиваете вид и копируете код. Программировать не нужно.",
  "ИИ-консультант работает 24/7, отвечает на вопросы клиентов, может записывать на консультации и рассказывать о ваших услугах.",
  "Можно настроить под ваш бренд: цвет, иконку, шрифт и положение виджета.",
  "Никаких своих ключей и сервисов не нужно: ответы ИИ включены в подписку.",
  "Консультант может работать на русском, английском и других языках. Настраивается через промпты.",
  `На одном аккаунте можно создать до ${PLAN.maxConsultants} консультантов — например, для разных сайтов.`,
  "Если что-то не получается, напишите на почту из раздела «Контакты».",
]

// Функция для релевантных ответов по ключевым словам (оставь без изменений)
function getRelevantResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("цена") || lowerMessage.includes("стоимость") || lowerMessage.includes("сколько")) {
    return `Это подписка: ${formatRub(PLAN.startPrice)} за подключение и первые ${PLAN.periodDays} дней, дальше ${formatRub(PLAN.renewPrice)} за каждые ${PLAN.periodDays} дней. Ответы ИИ уже включены в цену.`
  }

  if (lowerMessage.includes("tilda") || lowerMessage.includes("wordpress") || lowerMessage.includes("сайт")) {
    return "Да, код работает на Tilda (блок T123), на своём сайте и в любом конструкторе, где можно вставить HTML-код. Это одна строка, которую нужно скопировать и вставить."
  }

  if (lowerMessage.includes("настрой") || lowerMessage.includes("установ") || lowerMessage.includes("как")) {
    return "Настройка простая: скопируйте одну строку кода из кабинета и вставьте на сайт. На Tilda — в блок T123, на своём сайте — перед </body>."
  }

  if (lowerMessage.includes("программирован") || lowerMessage.includes("код") || lowerMessage.includes("сложно")) {
    return "Навыки программирования не нужны: в кабинете всё настраивается формой, а код для сайта — одна строка, которую нужно скопировать."
  }

  if (lowerMessage.includes("работа") || lowerMessage.includes("функци") || lowerMessage.includes("возможност")) {
    return "ИИ-консультант работает 24/7, отвечает на вопросы клиентов, может записывать на консультации, рассказывать о ваших услугах. Полностью настраивается под ваш бизнес."
  }

  if (lowerMessage.includes("дизайн") || lowerMessage.includes("внешний вид") || lowerMessage.includes("цвет")) {
    return "Да: в конструкторе выбираются цвет, иконка, шрифт и положение, а предпросмотр сразу показывает результат."
  }

  if (lowerMessage.includes("поддержка") || lowerMessage.includes("помощь") || lowerMessage.includes("вопрос")) {
    return "Если что-то не получается, напишите на почту из раздела «Контакты»."
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
    const timeoutId = setTimeout(() => controller.abort(), 20000) // 20 секунд: бесплатные модели бывают медленнее

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-consultant-six.vercel.app",
        "X-Title": "AI-Consultant",
      },
      body: JSON.stringify({
        ...modelFields(),
        messages: [
          {
            role: "system",
            content: `Ты профессиональный консультант по ИИ-решениям для сайтов. 
            Отвечай кратко, дружелюбно и по существу на русском языке.
            Помогаешь с вопросами о настройке ИИ-консультантов на сайты.
            Цена: ${formatRub(PLAN.startPrice)} за подключение и первые ${PLAN.periodDays} дней, дальше ${formatRub(PLAN.renewPrice)} за каждые ${PLAN.periodDays} дней. Ответы ИИ включены в цену, свои ключи не нужны.
            Как работает: оплата → письмо с паролем → в кабинете выбор ниши, данные о бизнесе, цвет/иконка/шрифт → одна строка кода на сайт.
            Работает на Tilda (блок T123, платный тариф Tilda), на своём сайте и в конструкторах со вставкой HTML-кода.
            Отвечай максимум в 2-3 предложения.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
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
