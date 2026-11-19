"use client"
import { reachGoal } from "@/lib/metrika"
import { formatDateRu } from "@/lib/date"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarCheck, CreditCard, Lock, Mail, RotateCcw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell, Spinner, subscriptionStatus, useAccount } from "@/components/account"
import { supabase } from "@/lib/supabase"
import { PLAN, formatRub } from "@/lib/plans"

function formatDate(d: Date) {
  return formatDateRu(d)
}

export default function PaymentPage() {
  const router = useRouter()
  const { user, profile, loading } = useAccount()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  if (loading) {
    return (
      <AppShell>
        <Spinner />
      </AppShell>
    )
  }

  const status = subscriptionStatus(profile)
  const isRenew = Boolean(profile?.subscription_ends_at)
  const amount = isRenew ? PLAN.renewPrice : PLAN.startPrice
  const from =
    status === "active" && profile?.subscription_ends_at ? new Date(profile.subscription_ends_at) : new Date()
  const until = new Date(from.getTime() + PLAN.periodDays * 24 * 60 * 60 * 1000)

  const handlePay = async () => {
    setError("")
    setIsProcessing(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        router.replace("/auth")
        return
      }
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      })
      const result = await response.json().catch(() => ({}))
      if (result?.success && result?.paymentUrl) {
        try {
          // Страница «Спасибо» сравнит дату окончания до и после оплаты
          sessionStorage.setItem("aic:prevEnds", profile?.subscription_ends_at ?? "")
        } catch {
          /* хранилище недоступно — не страшно */
        }
        reachGoal("payment_start")
        window.location.href = result.paymentUrl
        return
      }
      setError(result?.error || "Не удалось создать платёж. Попробуйте ещё раз.")
    } catch {
      setError("Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.")
    }
    setIsProcessing(false)
  }

  const trust = [
    {
      icon: Lock,
      title: "Оплата на защищённой странице ЮKassa",
      text: "Данные карты вводятся у ЮKassa и к нам не попадают.",
    },
    {
      icon: RotateCcw,
      title: "Без автосписаний",
      text: "Продлеваете сами, когда удобно. Карта не привязывается.",
    },
    {
      icon: Mail,
      title: "Подтверждение на почту",
      text: `Пришлём письмо на ${user?.email ?? "вашу почту"} сразу после оплаты.`,
    },
    {
      icon: ShieldCheck,
      title: "Можно вернуть деньги",
      text: "Вернём стоимость неиспользованных дней — по заявлению на почту.",
    },
  ]

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 gap-2 px-0">
        <ArrowLeft className="h-4 w-4" />
        В кабинет
      </Button>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {isRenew ? "Продление подписки" : "Включить консультанта на сайте"}
              </h1>
              <p className="mt-2 text-gray-600">
                {isRenew
                  ? "Консультант продолжит отвечать посетителям вашего сайта."
                  : "После оплаты консультант начнёт отвечать посетителям вашего сайта, а не только в кабинете."}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {isRenew ? `Продление на ${PLAN.periodDays} дней` : `Подключение и ${PLAN.periodDays} дней работы`}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                    <CalendarCheck className="h-4 w-4" />
                    Будет работать до {formatDate(until)}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-2xl font-bold text-gray-900">{formatRub(amount)}</span>
              </div>
              {!isRenew && (
                <p className="mt-4 border-t pt-4 text-sm text-gray-600">
                  Дальше — {formatRub(PLAN.renewPrice)} за каждые {PLAN.periodDays} дней. Продлеваете сами, только если
                  захотите.
                </p>
              )}
            </div>

            <div className="text-sm text-gray-600">
              Аккаунт: <b className="text-gray-900">{user?.email}</b>
            </div>

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div>
              <Button
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-lg hover:from-blue-700 hover:to-purple-700"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                    Переходим к оплате...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Оплатить {formatRub(amount)}
                  </span>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-gray-500">
                Нажимая «Оплатить», вы принимаете условия{" "}
                <a href="/terms" target="_blank" className="underline hover:text-gray-700">
                  публичной оферты
                </a>
                . Продавец — самозанятая Токарева А. А.,{" "}
                <a href="/contacts" target="_blank" className="underline hover:text-gray-700">
                  контакты
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900">Безопасно и без сюрпризов</h2>
            {trust.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-600" />
                </span>
                <div>
                  <p className="font-medium text-gray-900">{title}</p>
                  <p className="text-sm text-gray-600">{text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
