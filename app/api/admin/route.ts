import { NextResponse, type NextRequest } from "next/server"
import { adminFromRequest } from "@/lib/admin"
import { getAdmin } from "@/lib/supabase-admin"
import { answerLimits } from "@/lib/plans"
import { usageForAll } from "@/lib/usage"
import { getTemplate } from "@/lib/templates"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function addMonths(from: Date, months: number): Date {
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return d
}

export async function GET(request: NextRequest) {
  const admin = await adminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const db = getAdmin()
  const { data: rows, error } = await db
    .from("consultants")
    .select("id, user_id, name, allowed_domain, active_until, monthly_limit, client_note, created_at")
    .order("created_at", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const ids = [...new Set((rows ?? []).map((r) => r.user_id))]
  const { data: owners } = await db.from("users").select("id, email, subscription_ends_at").in("id", ids)
  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o]))
  const usage = await usageForAll()
  return NextResponse.json({
    consultants: (rows ?? []).map((r) => {
      const owner = ownerMap.get(r.user_id)
      return {
        ...r,
        owner_email: owner?.email ?? "",
        owner_subscription_ends_at: owner?.subscription_ends_at ?? null,
        mine: r.user_id === admin.id,
        limits: answerLimits(r.monthly_limit),
        usage: usage.get(r.id) ?? { today: 0, month: 0 },
      }
    }),
  })
}

type Body = {
  action?: string
  id?: string
  months?: number
  note?: string
  monthly_limit?: number | null
  active_until?: string | null
}

export async function POST(request: NextRequest) {
  const admin = await adminFromRequest(request)
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 })
  const body = ((await request.json().catch(() => ({}))) ?? {}) as Body
  const db = getAdmin()
  const months = Number(body.months)
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 300) : undefined

  if (body.action === "create") {
    if (![1, 3, 6, 12].includes(months)) return NextResponse.json({ error: "bad_months" }, { status: 400 })
    const t = getTemplate("psychologist")
    const { data, error } = await db
      .from("consultants")
      .insert({
        user_id: admin.id,
        name: "ИИ-ассистент",
        category: t.id,
        welcome_message: t.welcome,
        client_note: note ?? "",
        active_until: addMonths(new Date(), months).toISOString(),
      })
      .select("id")
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: data.id })
  }

  if (!body.id) return NextResponse.json({ error: "no_id" }, { status: 400 })
  const { data: row, error: rowError } = await db
    .from("consultants")
    .select("id, active_until")
    .eq("id", body.id)
    .maybeSingle()
  if (rowError || !row) return NextResponse.json({ error: "not_found" }, { status: 404 })

  if (body.action === "extend") {
    if (![1, 3, 6, 12].includes(months)) return NextResponse.json({ error: "bad_months" }, { status: 400 })
    const now = new Date()
    const base = row.active_until && new Date(row.active_until) > now ? new Date(row.active_until) : now
    const until = addMonths(base, months).toISOString()
    const { error } = await db.from("consultants").update({ active_until: until }).eq("id", row.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ active_until: until })
  }

  if (body.action === "update") {
    const patch: Record<string, unknown> = {}
    if (note !== undefined) patch.client_note = note
    if (body.monthly_limit !== undefined) {
      const lim = body.monthly_limit === null ? null : Math.round(Number(body.monthly_limit))
      if (lim !== null && !(lim >= 0 && lim <= 100000)) return NextResponse.json({ error: "bad_limit" }, { status: 400 })
      patch.monthly_limit = lim
    }
    if (body.active_until !== undefined) {
      if (body.active_until !== null && Number.isNaN(Date.parse(body.active_until))) {
        return NextResponse.json({ error: "bad_date" }, { status: 400 })
      }
      patch.active_until = body.active_until
    }
    if (Object.keys(patch).length === 0) return NextResponse.json({ error: "nothing" }, { status: 400 })
    const { error } = await db.from("consultants").update(patch).eq("id", row.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 })
}
