// Цены и лимиты в одном месте. Поменяйте здесь, и они обновятся везде:
// на лендинге, странице оплаты, в ответах демо-чата и при создании платежа.

export const PLAN = {
  /** Первый платёж: подключение + первые 30 дней */
  startPrice: 1990,
  /** Продление на следующие 30 дней */
  renewPrice: 990,
  /** На сколько дней продлевается подписка после оплаты */
  periodDays: 30,
  /** Сколько консультантов можно создать на одном аккаунте */
  maxConsultants: 3,
} as const

export type PaymentKind = "start" | "renew"

export function priceFor(kind: PaymentKind): number {
  return kind === "renew" ? PLAN.renewPrice : PLAN.startPrice
}

export function formatRub(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`
}
