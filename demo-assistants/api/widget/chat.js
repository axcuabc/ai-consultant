import { ASSISTANTS, askModel, cors, crisisReply, originAllowed, rateLimited, systemPrompt } from "../_lib.js"

export const config = { maxDuration: 45 }

export default async function handler(req, res) {
  cors(req, res)
  if (req.method === "OPTIONS") return res.status(204).end()
  if (req.method !== "POST") return res.status(405).json({ error: "method" })

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {}
  const a = ASSISTANTS[String(body.id || "")]
  if (!a) return res.status(404).json({ error: "not_found" })
  if (!originAllowed(req.headers.origin)) {
    return res.status(403).json({ error: "forbidden_origin", reply: "Этот помощник работает только на демо-сайте." })
  }

  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }))
  if (!history.length || history[history.length - 1].role !== "user") return res.status(400).json({ error: "bad_messages" })

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown"
  if (rateLimited(`ip:${ip}`, 15, 60_000) || rateLimited(`ipday:${ip}`, 60, 86_400_000)) {
    return res.status(429).json({ reply: "Слишком много сообщений подряд. Подождите немного и попробуйте снова." })
  }
  if (rateLimited(`day:${a.config.id}`, 400, 86_400_000)) {
    return res.status(429).json({ reply: "Демо-помощник на сегодня ответил на все вопросы. Загляните завтра!" })
  }

  const crisis = crisisReply(history[history.length - 1].content)
  if (crisis) return res.status(200).json({ reply: crisis })

  const answer = await askModel(systemPrompt(a), history)
  return res.status(200).json({
    reply: answer || "Не получилось ответить прямо сейчас. Попробуйте ещё раз или оставьте заявку в форме внизу страницы.",
  })
}
