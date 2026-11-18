import crypto from "crypto"
import { getAdmin, siteUrl } from "./supabase-admin"
import { PLAN } from "./plans"
import { sendPaymentEmail } from "./email"
import type { YooPayment } from "./yookassa"

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
 * Выдаёт доступ по успешному платежу: продлевает подписку владельца аккаунта
 * и отправляет письмо-подтверждение. Каждый платёж обрабатывается один раз.
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
    // 1. Чей это платёж. Оплата идёт из кабинета, поэтому user_id есть в metadata.
    //    Поиск по почте и создание аккаунта — запасной путь для старых платежей.
    let userId: string | null = null
    let createdAccount = false
    const metaUserId = payment.metadata?.user_id
    if (metaUserId) {
      const { data } = await db.auth.admin.getUserById(metaUserId)
      if (data?.user) userId = data.user.id
    }
    if (!userId) userId = await findAuthUserIdByEmail(email)
    if (!userId) {
      // Пароль никому не отправляем: человек задаст свой через «Забыли пароль?»
      const { data: created, error } = await db.auth.admin.createUser({
        email,
        password: crypto.randomBytes(24).toString("base64url"),
        email_confirm: true,
      })
      if (!created?.user) throw error ?? new Error("Не удалось создать пользователя")
      userId = created.user.id
      createdAccount = true
    }

    const { data: profile } = await db.from("users").select("id, subscription_ends_at").eq("id", userId).maybeSingle()

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
    await sendPaymentEmail(email, {
      until,
      amount,
      kind,
      dashboardUrl: `${siteUrl()}/dashboard`,
      authUrl: `${siteUrl()}/auth`,
      createdAccount,
    })

    return "done"
  } catch (err) {
    // Снимаем резерв, чтобы ЮKassa могла повторить уведомление
    await db.from("payments").delete().eq("payment_id", payment.id)
    throw err
  }
}
