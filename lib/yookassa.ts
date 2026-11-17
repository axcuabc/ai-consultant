import crypto from "crypto"

const API = "https://api.yookassa.ru/v3/payments"

function credentials() {
  const shopId = process.env.YOOKASSA_SHOP_ID || process.env.YOOMONEY_SHOP_ID
  const secret = process.env.YOOKASSA_SECRET_KEY || process.env.YOOMONEY_SECRET_KEY
  if (!shopId || !secret) throw new Error("ЮKassa не настроена: нужны YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY")
  return "Basic " + Buffer.from(`${shopId}:${secret}`).toString("base64")
}

export type YooPayment = {
  id: string
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled"
  paid: boolean
  amount: { value: string; currency: string }
  metadata?: Record<string, string>
}

export async function createPayment(input: {
  amount: number
  description: string
  returnUrl: string
  metadata: Record<string, string>
}): Promise<{ id: string; confirmationUrl: string }> {
  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": crypto.randomUUID(),
      Authorization: credentials(),
    },
    body: JSON.stringify({
      amount: { value: input.amount.toFixed(2), currency: "RUB" },
      confirmation: { type: "redirect", return_url: input.returnUrl },
      capture: true,
      description: input.description,
      metadata: input.metadata,
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data?.confirmation?.confirmation_url) {
    throw new Error(data?.description || `ЮKassa ответила ${res.status}`)
  }
  return { id: data.id, confirmationUrl: data.confirmation.confirmation_url }
}

/** Запрашивает платёж напрямую у ЮKassa. Так мы не доверяем содержимому вебхука. */
export async function fetchPayment(id: string): Promise<YooPayment | null> {
  if (!/^[0-9a-f-]{20,64}$/i.test(id)) return null
  const res = await fetch(`${API}/${id}`, { headers: { Authorization: credentials() }, cache: "no-store" })
  if (!res.ok) return null
  return (await res.json()) as YooPayment
}
