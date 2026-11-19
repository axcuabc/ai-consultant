"use client"
import { formatDateRu } from "@/lib/date"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarClock, Check, MessageCircle, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell, Spinner, subscriptionStatus, useAccount } from "@/components/account"
import EmbedCode from "@/components/EmbedCode"
import { supabase } from "@/lib/supabase"
import { PLAN, formatRub } from "@/lib/plans"
import { getTemplate } from "@/lib/templates"
import type { Consultant } from "@/lib/consultant"

function formatDate(iso: string | null) {
  return iso ? formatDateRu(iso) : "—"
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAccount()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [tested, setTested] = useState(false)

  useEffect(() => {
    try {
      setTested(consultants.some((c) => localStorage.getItem(`aic:tested:${c.id}`)))
    } catch {
      /* хранилище недоступно */
    }
  }, [consultants])

  useEffect(() => {
    if (!user) return
    supabase
      .from("consultants")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setConsultants((data as Consultant[]) ?? [])
        setListLoading(false)
      })
  }, [user])

  const remove = async (c: Consultant) => {
    if (!window.confirm(`Удалить «${c.name}»? Виджет перестанет работать на сайте.`)) return
    const { error } = await supabase.from("consultants").delete().eq("id", c.id)
    if (!error) setConsultants((list) => list.filter((x) => x.id !== c.id))
  }

  if (loading) {
    return (
      <AppShell>
        <Spinner />
      </AppShell>
    )
  }

  const status = subscriptionStatus(profile)
  const canCreate = consultants.length < PLAN.maxConsultants
  const hasConsultant = consultants.length > 0
  const steps = [
    { title: "Создайте консультанта", text: "Выберите нишу и расскажите о своих услугах", done: hasConsultant },
    { title: "Проверьте, как он отвечает", text: "Задайте ему вопросы как клиент — это бесплатно", done: tested },
    {
      title: "Включите на сайте",
      text: `${formatRub(PLAN.startPrice)} за подключение и ${PLAN.periodDays} дней, дальше ${formatRub(PLAN.renewPrice)}`,
      done: status === "active",
    },
    { title: "Вставьте код на сайт", text: "Одна строка — в Tilda или любой конструктор", done: false },
  ]

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Личный кабинет</h1>

      {status === "never" && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <p className="mb-4 font-semibold text-gray-900">Четыре шага до работающего консультанта</p>
            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      step.done ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{step.title}</p>
                    <p className="text-sm text-gray-600">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {hasConsultant && !tested ? (
              <Button
                onClick={() => router.push(`/template/edit/${consultants[0].id}?created=1`)}
                className="mt-6 gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <MessageCircle className="h-4 w-4" />
                Проверить консультанта
              </Button>
            ) : hasConsultant ? (
              <Button onClick={() => router.push("/payment")} className="mt-6 bg-gradient-to-r from-blue-600 to-purple-600">
                Включить на сайте — {formatRub(PLAN.startPrice)}
              </Button>
            ) : (
              <Button onClick={() => router.push("/template/create")} className="mt-6 gap-2 bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="h-4 w-4" />
                Создать консультанта
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {status !== "never" && (
        <Card className="mb-8">
          <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CalendarClock className="mt-1 h-6 w-6 text-blue-600" />
              <div>
                {status === "active" ? (
                  <>
                    <p className="font-semibold text-green-700">Консультант работает на сайте</p>
                    <p className="text-sm text-gray-600">Подписка до {formatDate(profile!.subscription_ends_at)}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-red-700">Подписка закончилась</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(profile!.subscription_ends_at)}. Виджет на сайте сейчас скрыт, все настройки сохранены.
                    </p>
                  </>
                )}
              </div>
            </div>
            <Button onClick={() => router.push("/payment")} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Продлить на {PLAN.periodDays} дней — {formatRub(PLAN.renewPrice)}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Мои консультанты</h2>
        {canCreate && (hasConsultant || status !== "never") && (
          <Button variant="outline" onClick={() => router.push("/template/create")} className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Plus className="h-4 w-4" />
            Создать
          </Button>
        )}
      </div>

      {listLoading ? (
        <Spinner />
      ) : consultants.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-600">
            Здесь появится ваш консультант. Нажмите «Создать консультанта» — это займёт 5 минут.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultants.map((c) => (
            <Card key={c.id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-full" style={{ background: c.theme_color }} aria-hidden />
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-500">
                        {getTemplate(c.category).title}
                        {c.allowed_domain ? ` · ${c.allowed_domain}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/template/edit/${c.id}`)} className="gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Проверить и настроить
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c)} aria-label="Удалить">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                {status === "active" ? (
                  <EmbedCode id={c.id} />
                ) : (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    Сейчас консультант отвечает только в кабинете: нажмите «Проверить и настроить» и задайте ему вопросы. Код
                    для сайта появится после оплаты.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  )
}
