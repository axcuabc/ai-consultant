// Статистика посещений: Яндекс Метрика (NEXT_PUBLIC_YM_ID) и Google Analytics 4
// (NEXT_PUBLIC_GA_ID). Без переменной соответствующий сервис не подключается,
// а цели для него молча пропускаются.

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID || 0)
const GA_RAW = (process.env.NEXT_PUBLIC_GA_ID || "").trim()
export const GA_ID = /^G-[A-Z0-9]{4,20}$/.test(GA_RAW) ? GA_RAW : ""

type Ym = (id: number, method: string, ...args: unknown[]) => void

/** Отметить цель: signup, consultant_created, payment_start, payment_success. */
export function reachGoal(goal: string): void {
  if (typeof window === "undefined") return
  try {
    const w = window as unknown as { ym?: Ym; gtag?: (...args: unknown[]) => void }
    if (YM_ID) w.ym?.(YM_ID, "reachGoal", goal)
    if (GA_ID) w.gtag?.("event", goal)
  } catch {
    /* аналитика не должна ломать сайт */
  }
}
