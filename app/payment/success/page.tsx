"use client"
import { reachGoal } from "@/lib/metrika"
import { formatDateRu } from "@/lib/date"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle, Clock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

type State = "checking" | "active" | "slow"

/** После оплаты ЮKassa возвращает сюда. Ждём, пока подтверждение дойдёт до сервера. */
export default function PaymentSuccessPage() {
  const [state, setState] = useState<State>("checking")
  const [until, setUntil] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    const started = Date.now()
    let prev = 0
    try {
      const saved = sessionStorage.getItem("aic:prevEnds")
      if (saved) prev = new Date(saved).getTime() || 0
    } catch {
      /* хранилище недоступно */
    }
    const check = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (auth.user) {
        const { data } = await supabase.from("users").select("subscription_ends_at").eq("id", auth.user.id).maybeSingle()
        const ends = data?.subscription_ends_at ? new Date(data.subscription_ends_at) : null
        // Платёж засчитан, если дата окончания сдвинулась вперёд
        if (ends && ends.getTime() > Math.max(prev, Date.now()) + 60_000 && alive) {
          setUntil(formatDateRu(ends))
          setState("active")
          reachGoal("payment_success")
          return
        }
      }
      if (!alive) return
      if (Date.now() - started > 90_000) setState("slow")
      else setTimeout(check, 3000)
    }
    check()
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-8 text-center">
          {state === "active" ? (
            <>
              <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
              <h1 className="text-2xl font-bold text-gray-900">Готово! Консультант включён</h1>
              <p className="text-gray-600">
                Он работает на вашем сайте до <b>{until}</b>. Подтверждение оплаты отправили на почту.
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href="/dashboard">Перейти в кабинет</Link>
              </Button>
            </>
          ) : state === "checking" ? (
            <>
              <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Проверяем оплату…</h1>
              <p className="text-gray-600">Обычно это занимает несколько секунд. Не закрывайте страницу.</p>
            </>
          ) : (
            <>
              <Clock className="mx-auto h-14 w-14 text-amber-500" />
              <h1 className="text-2xl font-bold text-gray-900">Платёж ещё обрабатывается</h1>
              <p className="text-gray-600">
                Иногда банку нужно чуть больше времени. Как только оплата подтвердится, консультант включится сам, а мы
                пришлём письмо. Деньги не потеряются.
              </p>
              <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left text-sm text-blue-900">
                <Mail className="mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  Если через час подписка в кабинете не появилась, напишите на{" "}
                  <a className="underline" href="mailto:ai.consultant.site@gmail.com">
                    ai.consultant.site@gmail.com
                  </a>
                  . Разберёмся.
                </span>
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Перейти в кабинет</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
