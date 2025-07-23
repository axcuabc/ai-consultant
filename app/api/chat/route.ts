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

    console.log("Ответ от модели HF:", aiResponse) // Логируем для отладки

    // Если модель дала более 5 символов — отдаём её ответ
    if (aiResponse && aiResponse.trim().length > 5) {
      return NextResponse.json({ response: aiResponse.trim() })
    }

    // Если нет — fallback
    const fallbackResponse = getRelevantResponse(message)

    return NextResponse.json({ response: fallbackResponse })
  } catch (error) {
    console.error("API Route Error:", error)

    const fallbackResponse =
      FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)]
    return NextResponse.json({ response: fallbackResponse })
  }
}
