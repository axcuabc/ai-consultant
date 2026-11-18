import { NextResponse, type NextRequest } from "next/server"
import { buildSystemPrompt } from "@/lib/consultant"
import { getDemo } from "@/lib/demo"
import { askModel, rateLimited, type ChatMessage } from "@/lib/widget-server"
import { clientIp } from "@/lib/auth-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

// Демо на главной: те же правила и промпт, что у настоящих консультантов клиентов.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const demo = getDemo(body?.type)
  if (!demo) return NextResponse.json({ response: "Демо не найдено." }, { status: 400 })

  const history: ChatMessage[] = (Array.isArray(body?.messages) ? body.messages : [])
    .slice(-6)
    .filter(
      (m: unknown): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
    .map((m: ChatMessage) => ({ role: m.role, content: m.content.slice(0, 500) }))
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return NextResponse.json({ response: "Напишите вопрос." }, { status: 400 })
  }

  if (rateLimited(`demo:${clientIp(request)}`, 15, 60 * 60_000)) {
    return NextResponse.json({
      response: "Вы задали много вопросов в демо. Создайте своего консультанта — это бесплатно — и проверяйте сколько угодно.",
    })
  }

  const answer = await askModel(buildSystemPrompt(demo.consultant), history)
  return NextResponse.json({
    response: answer ?? "Не получилось ответить прямо сейчас — попробуйте, пожалуйста, ещё раз через минуту.",
  })
}
