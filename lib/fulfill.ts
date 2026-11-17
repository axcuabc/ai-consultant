import crypto from "crypto"
import { getAdmin, siteUrl } from "./supabase-admin"
import { PLAN } from "./plans"
import { sendRenewalEmail, sendWelcomeEmail } from "./email"
import type { YooPayment } from "./yookassa"

function generatePassword(length = 12) {
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
  let out = ""
  for (let i = 0; i < length; i++) out += charset[crypto.randomInt(0, charset.length)]
  return out
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const db = getAdmin()
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const found = data.users.find((u) => u.email?.toLowerCase() === email)
    if (found) return found.id
    if (data.users.length < 1000) return null
  }
  return null
}

/**
 * Выдаёт доступ по успешному платежу: создаёт аккаунт (если его нет), продлевает
 * подписку и отправляет письмо. Каждый платёж обрабатывается один раз.
 */
export async function fulfillPayment(payment: YooPayment): Promise<"done" | "duplicate" | "skipped"> {
  if (payment.status !== "succeeded" || !payment.paid) return "skipped"
  const email = payment.metadata?.email?.trim().toLowerCase()
  if (!email) {
    console.error("Платёж без email в metadata:", payment.id)
    return "skipped"
  }
  const kind = payment.metadata?.kind === "renew" ? "renew" : "start"
  const amount = Number(payment.amount.value)
  const db = getAdmin()

  // Резервируем платёж. Если строка уже есть, значит, его уже обработали.
  const { data: reserved, error: reserveError } = await db
    .from("payments")
    .upsert({ payment_id: payment.id, email, kind, amount, status: "processing" }, { onConflict: "payment_id", ignoreDuplicates: true })
    .select("payment_id")
  if (reserveError) throw reserveError
  if (!reserved || reserved.length === 0) return "duplicate"

  try {
    // 1. Найти или создать пользователя
    let userId: string | null = null
    let password: string | null = null

    const { data: profile } = await db.from("users").select("id, subscription_ends_at").eq("email", email).maybeSingle()
    if (profile) {
      userId = profile.id
    } else {
      const newPassword = generatePassword()
      const { data: created, error } = await db.auth.admin.createUser({ email, password: newPassword, email_confirm: true })
      if (created?.user) {
        userId = created.user.id
        password = newPassword
      } else {
        // Аккаунт уже есть (например, человек сам зарегистрировался до оплаты)
        userId = await findAuthUserIdByEmail(email)
        if (!userId) throw error ?? new Error("Не удалось создать пользователя")
      }
    }

    // 2. Продлить подписку от текущей даты окончания или от сегодня
    const currentEnd = profile?.subscription_ends_at ? new Date(profile.subscription_ends_at) : null
    const base = currentEnd && currentEnd > new Date() ? currentEnd : new Date()
    const until = new Date(base.getTime() + PLAN.periodDays * 24 * 60 * 60 * 1000)

    const { error: upsertError } = await db
      .from("users")
      .upsert({ id: userId, email, subscription_ends_at: until.toISOString(), has_paid: true }, { onConflict: "id" })
    if (upsertError) throw upsertError

    await db.from("payments").update({ user_id: userId, status: "succeeded" }).eq("payment_id", payment.id)

    // 3. Письмо (ошибка отправки не отменяет доступ)
    const loginUrl = `${siteUrl()}/auth`
    if (password) await sendWelcomeEmail(email, password, loginUrl, until)
    else await sendRenewalEmail(email, loginUrl, until, !profile)

    return "done"
  } catch (err) {
    // Снимаем резерв, чтобы ЮKassa могла повторить уведомление
    await db.from("payments").delete().eq("payment_id", payment.id)
    throw err
  }
}
