import { getAdmin } from "./supabase-admin"

/** Текущая дата по Москве в формате YYYY-MM-DD (так же считает функция в базе). */
export function moscowDay(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(date)
}

export function monthStart(day = moscowDay()): string {
  return `${day.slice(0, 7)}-01`
}

/** Сколько ответов консультант дал сегодня и в этом месяце (по Москве). */
export async function usageFor(id: string): Promise<{ today: number; month: number }> {
  const today = moscowDay()
  const { data, error } = await getAdmin()
    .from("consultant_usage")
    .select("day, answers")
    .eq("consultant_id", id)
    .gte("day", monthStart(today))
  if (error) throw error
  let month = 0
  let todayCount = 0
  for (const row of data ?? []) {
    month += row.answers
    if (row.day === today) todayCount += row.answers
  }
  return { today: todayCount, month }
}

/** Месячная статистика по всем консультантам сразу (для админки). */
export async function usageForAll(): Promise<Map<string, { today: number; month: number }>> {
  const today = moscowDay()
  const { data, error } = await getAdmin()
    .from("consultant_usage")
    .select("consultant_id, day, answers")
    .gte("day", monthStart(today))
  if (error) throw error
  const out = new Map<string, { today: number; month: number }>()
  for (const row of data ?? []) {
    const u = out.get(row.consultant_id) ?? { today: 0, month: 0 }
    u.month += row.answers
    if (row.day === today) u.today += row.answers
    out.set(row.consultant_id, u)
  }
  return out
}

export async function recordAnswer(id: string): Promise<void> {
  const { error } = await getAdmin().rpc("bump_consultant_usage", { p_id: id })
  if (error) console.error("usage:", error.message)
}
