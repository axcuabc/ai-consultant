import { modelList } from "./models"
import { getAdmin } from "./supabase-admin"
import type { Consultant } from "./consultant"

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID.test(value)
}

/** Консультант + активна ли подписка его владельца. */
export async function loadConsultant(id: string): Promise<{ consultant: Consultant; active: boolean } | null> {
  const db = getAdmin()
  const { data: consultant, error } = await db.from("consultants").select("*").eq("id", id).maybeSingle()
  if (error) throw error
  if (!consultant) return null
  const { data: owner, error: ownerError } = await db
    .from("users")
    .select("subscription_ends_at")
    .eq("id", consultant.user_id)
    .maybeSingle()
  if (ownerError) throw ownerError
  const active = Boolean(owner?.subscription_ends_at && new Date(owner.subscription_ends_at) > new Date())
  return { consultant: consultant as Consultant, active }
}

/** Разрешён ли сайт, с которого пришёл запрос. Пустое allowed_domain = любой сайт. */
export function originAllowed(allowedDomain: string, origin: string | null): boolean {
  const allowed = allowedDomain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "")
  if (!allowed) return true
  if (!origin) return false
  let host: string
  try {
    host = new URL(origin).hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return false
  }
  return host === allowed || host.endsWith(`.${allowed}`)
}

// Простое ограничение частоты запросов в памяти. На Vercel у каждого экземпляра
// функции своя память, так что это защита от простого спама, а не жёсткий лимит.
const hits = new Map<string, number[]>()

export function rateLimited(key: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(key, recent)
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
  }
  return recent.length > limit
}

export type ChatMessage = { role: "user" | "assistant"; content: string }

export async function askModel(systemPrompt: string, messages: ChatMessage[]): Promise<string | null> {
  // Бесплатные модели иногда возвращают пустой или оборванный ответ
  // (например, когда рассуждения съели лимит токенов). Тогда пробуем ещё раз
  // со следующей моделью из списка.
  const models = modelList()
  const attempts = models.length > 1 ? [models, [...models.slice(1), models[0]]] : [models, models]
  for (let i = 0; i < attempts.length; i++) {
    const result = await callModel(systemPrompt, messages, attempts[i])
    if (result.ok) return result.text
    if (!result.retry) return null
    console.warn(`OpenRouter: попытка ${i + 1} без ответа (${result.reason})`)
  }
  return null
}

type ModelResult = { ok: true; text: string } | { ok: false; retry: boolean; reason: string }

async function callModel(systemPrompt: string, messages: ChatMessage[], models: string[]): Promise<ModelResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    console.error("OPENROUTER_API_KEY не задан")
    return { ok: false, retry: false, reason: "no_key" }
  }
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "AI-Consultant",
      },
      body: JSON.stringify({
        ...(models.length === 1 ? { model: models[0] } : { models: models.slice(0, 3) }),
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        // С запасом: у «думающих» моделей рассуждения тоже расходуют этот лимит
        max_tokens: 2000,
        temperature: 0.5,
        // У «думающих» моделей рассуждения не показываем и делаем короткими
        reasoning: { effort: "low", exclude: true },
        // Платные модели — только у поставщиков, которые не сохраняют переписку.
        // Бесплатные (запасной вариант, если кончился баланс) без этого условия не работают.
        ...(models[0].endsWith(":free") ? {} : { provider: { data_collection: "deny" } }),
      }),
    })
    if (!res.ok) {
      console.error("OpenRouter:", res.status, await res.text().catch(() => ""))
      return { ok: false, retry: res.status >= 500 || res.status === 429 || res.status === 402, reason: `http_${res.status}` }
    }
    const data = await res.json()
    const choice = data?.choices?.[0]
    const reply = choice?.message?.content
    const text = typeof reply === "string" ? reply.trim() : ""
    if (!text) return { ok: false, retry: true, reason: `empty:${data?.model ?? "?"}:${choice?.finish_reason ?? "?"}` }
    if (choice?.finish_reason === "length") {
      return { ok: false, retry: true, reason: `length:${data?.model ?? "?"}` }
    }
    return { ok: true, text }
  } catch (err) {
    console.error("OpenRouter error:", err)
    return { ok: false, retry: true, reason: "network" }
  } finally {
    clearTimeout(timeout)
  }
}
