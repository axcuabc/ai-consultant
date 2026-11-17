import { NextResponse, type NextRequest } from "next/server"
import { getAdmin } from "@/lib/supabase-admin"
import { askModel, rateLimited } from "@/lib/widget-server"
import { modelList } from "@/lib/models"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

// Проверка, что сайт жив: /api/health — база; /api/health?ai=1 — ещё и ответ ИИ.
// Подходит для бесплатного мониторинга (например, UptimeRobot) без ?ai=1,
// чтобы не тратить дневной лимит бесплатных моделей.
export async function GET(request: NextRequest) {
  const result: Record<string, unknown> = { ok: true }

  try {
    const { error } = await getAdmin().from("consultants").select("id", { head: true, count: "exact" }).limit(1)
    result.db = error ? `error: ${error.message}` : "ok"
    if (error) result.ok = false
  } catch (err) {
    result.db = `error: ${err instanceof Error ? err.message : String(err)}`
    result.ok = false
  }

  if (request.nextUrl.searchParams.get("ai") === "1") {
    result.models = modelList()
    if (!process.env.OPENROUTER_API_KEY) {
      result.ai = "error: OPENROUTER_API_KEY не задан"
      result.ok = false
    } else if (rateLimited("health-ai", 5, 60 * 60 * 1000)) {
      result.ai = "skipped: слишком часто, попробуйте через час"
    } else {
      const started = Date.now()
      const reply = await askModel("Ты проверка связи. Ответь одним коротким словом по-русски.", [
        { role: "user", content: "Скажи «работает»." },
      ])
      result.ai = reply ? `ok: «${reply.slice(0, 80)}»` : "error: модель не ответила (лимит или перегрузка)"
      result.ai_ms = Date.now() - started
      if (!reply) result.ok = false
    }
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } })
}
