// Письма через Resend (https://resend.com). Ключ: EMAIL_API_KEY или RESEND_API_KEY.

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

async function send(to: string, subject: string, body: string): Promise<boolean> {
  const key = process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY
  if (!key) {
    console.error("Почта не настроена: нет EMAIL_API_KEY")
    return false
  }
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111827">
      <div style="background:linear-gradient(135deg,#3B82F6,#8B5CF6);padding:24px;border-radius:12px 12px 0 0;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:22px">ИИ Консультант</h1>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 12px 12px;line-height:1.5">
        ${body}
      </div>
    </div>`
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "onboarding@resend.dev",
        to: [to],
        reply_to: process.env.SUPPORT_EMAIL || "ai.consultant.site@gmail.com",
        subject,
        html,
      }),
    })
    if (!res.ok) console.error("Resend:", res.status, await res.text().catch(() => ""))
    return res.ok
  } catch (err) {
    console.error("Resend error:", err)
    return false
  }
}

function button(href: string, text: string) {
  return `<p style="text-align:center;margin:24px 0"><a href="${escapeHtml(href)}" style="background:#4F46E5;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">${escapeHtml(text)}</a></p>`
}

export function sendPaymentEmail(
  to: string,
  info: { until: Date; amount: number; kind: "start" | "renew"; dashboardUrl: string; authUrl: string; createdAccount: boolean },
) {
  const date = info.until.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/ г\.$/, " года")
  const sum = new Intl.NumberFormat("ru-RU").format(info.amount)
  return send(
    to,
    info.kind === "renew" ? "Подписка продлена" : "Оплата прошла — консультант включён",
    `<h2 style="margin-top:0">Спасибо за оплату!</h2>
     <p>Мы получили ${sum} ₽. Ваш ИИ-консультант работает на сайте до <b>${date}</b>.</p>
     ${
       info.createdAccount
         ? `<p>Для этой почты мы создали аккаунт. Чтобы войти, нажмите «Забыли пароль?» на странице входа и задайте свой пароль.</p>${button(info.authUrl, "Задать пароль и войти")}`
         : button(info.dashboardUrl, "Открыть кабинет")
     }
     <p style="color:#6b7280;font-size:13px">Автоматических списаний нет: продлить подписку можно в кабинете, когда будет удобно.
     Если оплату совершали не вы, просто ответьте на это письмо.</p>`,
  )
}
