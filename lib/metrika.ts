// Яндекс Метрика. Номер счётчика задаётся переменной NEXT_PUBLIC_YM_ID на Vercel;
// без неё ничего не подключается и цели молча пропускаются.

export const YM_ID = Number(process.env.NEXT_PUBLIC_YM_ID || 0)

type Ym = (id: number, method: string, ...args: unknown[]) => void

/** Отметить цель в Метрике: signup, consultant_created, payment_start, payment_success. */
export function reachGoal(goal: string): void {
  if (!YM_ID || typeof window === "undefined") return
  try {
    const ym = (window as unknown as { ym?: Ym }).ym
    ym?.(YM_ID, "reachGoal", goal)
  } catch {
    /* аналитика не должна ломать сайт */
  }
}
