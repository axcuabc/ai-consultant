import { NextResponse, type NextRequest } from "next/server"
import { buildSystemPrompt } from "@/lib/consultant"
import {
  CORS_HEADERS,
  askModel,
  isUuid,
  loadConsultant,
  originAllowed,
  rateLimited,
  type ChatMessage,
} from "@/lib/widget-server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

const MAX_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 1000

function reply(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS })
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return reply({ error: "bad_json" }, 400)
  }
  const { id, messages } = (body ?? {}) as { id?: unknown; messages?: unknown }

  if (!isUuid(id)) return reply({ error: "bad_id" }, 400)
  if (!Array.isArray(messages) || messages.length === 0) return reply({ error: "no_messages" }, 400)

  const history: ChatMessage[] = messages
    .slice(-MAX_MESSAGES)
    .filter(
      (m): m is ChatMessage =>
        !!m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "",
    )
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_LENGTH) }))
  if (history.length === 0 || history[history.length - 1].role !== "user") return reply({ error: "bad_messages" }, 400)

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (rateLimited(`${id}:${ip}`) || rateLimited(`consultant:${id}`, 120)) {
    return reply({ reply: "Слишком много сообщений подряд. Подождите минуту и попробуйте снова." }, 429)
  }

  try {
    const found = await loadConsultant(id)
    if (!found) return reply({ error: "not_found" }, 404)
    if (!found.active) return reply({ error: "inactive", reply: "Консультант сейчас недоступен." }, 403)
    if (!originAllowed(found.consultant.allowed_domain, request.headers.get("origin"))) {
      return reply({ error: "forbidden_origin" }, 403)
    }

    const answer = await askModel(buildSystemPrompt(found.consultant), history)
    if (!answer) {
      const contact = found.consultant.contact_cta.trim()
      return reply({
        reply: contact
          ? `Не получилось ответить прямо сейчас. Свяжитесь, пожалуйста, напрямую: ${contact}`
          : "Не получилось ответить прямо сейчас. Попробуйте, пожалуйста, чуть позже.",
      })
    }
    return reply({ reply: answer })
  } catch (err) {
    console.error("widget/chat:", err)
    return reply({ error: "server_error", reply: "Ошибка сервера. Попробуйте позже." }, 500)
  }
}
