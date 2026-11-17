import { type NextRequest, NextResponse } from "next/server"
import { PLAN, formatRub } from "@/lib/plans"

// Ключ OpenRouter берётся из переменных окружения (Vercel → Settings → Environment Variables)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
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

// Системные промпты для демо-консультантов
const SYSTEM_PROMPTS: Record<string, string> = {
  psychology: `Ты заботливый и эмпатичный психолог. Отвечай кратко, с теплом и поддержкой, на русском языке.
Помогаешь справиться со стрессом, тревожностью, выгоранием и сложностями в отношениях.
Отвечай понятно и деликатно, избегая профессионального жаргона.`,

  diet: `Ты сертифицированный диетолог. Отвечай кратко, понятно и доброжелательно на русском языке.
Помогаешь с вопросами питания, режима дня, дефицита витаминов, набора или снижения веса.
Не давай диагнозов, но можешь рекомендовать анализы, питание и привычки.`,

  business: `Ты опытный бизнес-ментор. Отвечай кратко, уверенно и понятно на русском языке.
Помогаешь начинающим предпринимателям, фрилансерам и создателям онлайн-продуктов.
Можешь подсказать с нишей, продуктом, упаковкой, ценой, стратегией и продвижением.`,
}

// Функция для релевантных ответов по ключевым словам
function getRelevantResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes("цена") || lowerMessage.includes("стоимость")) {
    return `Это подписка: ${formatRub(PLAN.startPrice)} за подключение и первые ${PLAN.periodDays} дней, дальше ${formatRub(PLAN.renewPrice)} за каждые ${PLAN.periodDays} дней. Ответы ИИ уже включены в цену.`
  }

  if (lowerMessage.includes("настрой") || lowerMessage.includes("установ") || lowerMessage.includes("как")) {
    return "Настройка очень простая! Скопируйте наш HTML-код и вставьте его на сайт перед закрывающим тегом </body>."
  }

  if (lowerMessage.includes("привет") || lowerMessage.includes("здравствуй")) {
    return "Привет! Я ваш ИИ-консультант. Чем могу помочь?"
  }

  // Другие шаблоны можно добавить по аналогии

  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
}

// Запрос к OpenRouter
async function queryOpenRouter(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.error("OpenRouter API key not configured")
    return null
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`OpenRouter API error: ${response.status}`)
      return null
    }

    const data = await response.json()
    const aiText = data.choices?.[0]?.message?.content
    return aiText ? aiText.trim() : null
  } catch (error: any) {
    console.error("OpenRouter request failed:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, message } = await request.json()
    if (!message || typeof message !== "string") {
      return NextResponse.json({ response: "Пожалуйста, отправьте текст сообщения" })
    }

    // Выбираем системный промпт по типу консультанта
    const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS["business"]

    // Пытаемся получить ответ от AI
const aiResponse = await queryOpenRouter(systemPrompt, message)
if (aiResponse) {
  return NextResponse.json({ response: aiResponse })
}


    // Иначе релевантный шаблон
    const fallback = getRelevantResponse(message)
    return NextResponse.json({ response: fallback })
  } catch (error) {
    console.error("API Route Error:", error)
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({ response: fallback })
  }
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
