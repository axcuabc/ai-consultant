"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CalendarClock, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell, Spinner, subscriptionStatus, useAccount } from "@/components/account"
import EmbedCode from "@/components/EmbedCode"
import { supabase } from "@/lib/supabase"
import { PLAN, formatRub } from "@/lib/plans"
import { getTemplate } from "@/lib/templates"
import type { Consultant } from "@/lib/consultant"

function formatDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "—"
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAccount()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [listLoading, setListLoading] = useState(true)

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
  const payHref = `/payment?email=${encodeURIComponent(user?.email ?? "")}&kind=${status === "never" ? "start" : "renew"}`
  const canCreate = profile && consultants.length < PLAN.maxConsultants

  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Личный кабинет</h1>

      <Card className="mb-8">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CalendarClock className="mt-1 h-6 w-6 text-blue-600" />
            <div>
              {status === "active" && (
                <>
                  <p className="font-semibold text-green-700">Подписка активна</p>
                  <p className="text-sm text-gray-600">До {formatDate(profile!.subscription_ends_at)}</p>
                </>
              )}
              {status === "expired" && (
                <>
                  <p className="font-semibold text-red-700">Подписка закончилась</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(profile!.subscription_ends_at)}. Виджеты на сайтах сейчас скрыты, настройки сохранены.
                  </p>
                </>
              )}
              {status === "never" && (
                <>
                  <p className="font-semibold text-gray-900">Подписки пока нет</p>
                  <p className="text-sm text-gray-600">Оплатите доступ, чтобы создать консультанта и поставить его на сайт.</p>
                </>
              )}
            </div>
          </div>
          <Button onClick={() => router.push(payHref)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            {status === "never"
              ? `Оплатить ${formatRub(PLAN.startPrice)}`
              : `Продлить на ${PLAN.periodDays} дней — ${formatRub(PLAN.renewPrice)}`}
          </Button>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Мои консультанты</h2>
        {canCreate && (
          <Button onClick={() => router.push("/template/create")} className="gap-2">
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
            {profile
              ? "Пока нет ни одного консультанта. Нажмите «Создать», выберите нишу и оформление."
              : "После оплаты здесь появится конструктор консультанта."}
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
                      <Pencil className="h-4 w-4" />
                      Изменить
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(c)} aria-label="Удалить">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                <EmbedCode id={c.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  )
}
