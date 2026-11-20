"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppShell, Spinner, useAccount } from "@/components/account"
import EmbedCode from "@/components/EmbedCode"
import { supabase } from "@/lib/supabase"
import { formatDateRu } from "@/lib/date"

type Row = {
  id: string
  name: string
  allowed_domain: string
  active_until: string | null
  monthly_limit: number | null
  client_note: string
  owner_email: string
  owner_subscription_ends_at: string | null
  mine: boolean
  limits: { month: number; day: number }
  usage: { today: number; month: number }
}

const DAY = 24 * 60 * 60 * 1000

async function call(method: "GET" | "POST", body?: object) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const res = await fetch("/api/admin", {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
  return json
}

function termInfo(r: Row) {
  const now = Date.now()
  if (r.active_until) {
    const left = Math.ceil((new Date(r.active_until).getTime() - now) / DAY)
    if (left <= 0) return { text: `Выключен с ${formatDateRu(r.active_until)}`, tone: "red" as const }
    return {
      text: `Работает до ${formatDateRu(r.active_until)} · осталось ${left} дн.`,
      tone: left <= 14 ? ("amber" as const) : ("green" as const),
    }
  }
  const sub = r.owner_subscription_ends_at
  if (sub && new Date(sub).getTime() > now) return { text: `По подписке владельца до ${formatDateRu(sub)}`, tone: "green" as const }
  return { text: "Не включён (нет срока и подписки)", tone: "gray" as const }
}

const TONES = {
  green: "bg-green-50 text-green-800",
  amber: "bg-amber-50 text-amber-900",
  red: "bg-red-50 text-red-800",
  gray: "bg-gray-100 text-gray-700",
}

export default function AdminPage() {
  const { loading } = useAccount()
  const [rows, setRows] = useState<Row[] | null>(null)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState("")
  const [note, setNote] = useState("")
  const [months, setMonths] = useState(3)
  const [filter, setFilter] = useState<"kwork" | "all">("kwork")

  const load = useCallback(async () => {
    try {
      const data = await call("GET")
      setRows(data.consultants)
      setError("")
    } catch (e) {
      setError(e instanceof Error && e.message === "forbidden" ? "Эта страница только для администратора." : String(e))
    }
  }, [])

  useEffect(() => {
    if (!loading) load()
  }, [loading, load])

  const act = async (key: string, body: object) => {
    setBusy(key)
    try {
      await call("POST", body)
      await load()
    } catch (e) {
      alert(`Не получилось: ${e instanceof Error ? e.message : e}`)
    } finally {
      setBusy("")
    }
  }

  const create = async () => {
    setBusy("create")
    try {
      const { id } = await call("POST", { action: "create", note, months })
      window.location.href = `/template/edit/${id}`
    } catch (e) {
      alert(`Не получилось: ${e instanceof Error ? e.message : e}`)
      setBusy("")
    }
  }

  if (loading || (!rows && !error)) {
    return (
      <AppShell>
        <Spinner />
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <p className="text-gray-700">{error}</p>
      </AppShell>
    )
  }

  const list = (rows ?? []).filter((r) => filter === "all" || r.active_until !== null || r.client_note)
  const expiring = (rows ?? []).filter((r) => {
    if (!r.active_until) return false
    const left = (new Date(r.active_until).getTime() - Date.now()) / DAY
    return left > -30 && left <= 14
  })

  return (
    <AppShell>
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Помощники клиентов</h1>
      <p className="mb-6 text-gray-600">
        Помощники, проданные через Кворк: срок работы, лимит ответов и продление. Создаются на вашем аккаунте, клиент
        ничего не регистрирует.
      </p>

      {expiring.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-5">
            <p className="font-semibold text-amber-900">Пора напомнить о продлении</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-900">
              {expiring.map((r) => (
                <li key={r.id}>
                  {r.client_note || r.name}
                  {r.allowed_domain ? ` (${r.allowed_domain})` : ""} — до {formatDateRu(r.active_until!)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mb-8">
        <CardContent className="p-6">
          <p className="mb-3 font-semibold text-gray-900">Новый помощник для клиента</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={300}
              placeholder="Пометка: имя клиента, сайт, номер заказа на Кворке"
              className="min-h-11 flex-1 rounded-lg border border-gray-300 px-3"
            />
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="min-h-11 rounded-lg border border-gray-300 px-3"
            >
              {[1, 3, 6, 12].map((m) => (
                <option key={m} value={m}>
                  {m} мес.
                </option>
              ))}
            </select>
            <Button onClick={create} disabled={busy === "create"} className="min-h-11 gap-2">
              <Plus className="h-4 w-4" />
              Создать и настроить
            </Button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            После создания откроется редактор: заполните данные о психологе и укажите домен сайта клиента.
          </p>
        </CardContent>
      </Card>

      <div className="mb-4 flex gap-2">
        <Button variant={filter === "kwork" ? "default" : "outline"} onClick={() => setFilter("kwork")}>
          Клиенты Кворка
        </Button>
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          Все консультанты
        </Button>
      </div>

      <div className="space-y-4">
        {list.length === 0 && <p className="text-gray-600">Пока пусто.</p>}
        {list.map((r) => {
          const term = termInfo(r)
          const share = Math.min(100, Math.round((r.usage.month / Math.max(1, r.limits.month)) * 100))
          return (
            <Card key={r.id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{r.client_note || r.name}</p>
                    <p className="text-sm text-gray-600">
                      {r.name}
                      {r.allowed_domain ? ` · ${r.allowed_domain}` : " · домен не указан"}
                      {!r.mine && ` · владелец ${r.owner_email}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm ${TONES[term.tone]}`}>{term.text}</span>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-sm text-gray-700">
                    <span>
                      Ответов в этом месяце: {r.usage.month} из {r.limits.month}
                    </span>
                    <span>
                      сегодня {r.usage.today} из {r.limits.day}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${share >= 90 ? "bg-red-500" : share >= 70 ? "bg-amber-500" : "bg-green-500"}`}
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-600">Продлить:</span>
                  {[3, 6, 12].map((m) => (
                    <Button
                      key={m}
                      variant="outline"
                      size="sm"
                      disabled={busy === `${r.id}:${m}`}
                      onClick={() => act(`${r.id}:${m}`, { action: "extend", id: r.id, months: m })}
                    >
                      +{m} мес.
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const v = window.prompt(
                        "Лимит ответов в месяц (пусто — по умолчанию, 1000):",
                        r.monthly_limit === null ? "" : String(r.monthly_limit),
                      )
                      if (v === null) return
                      act(`${r.id}:lim`, { action: "update", id: r.id, monthly_limit: v.trim() === "" ? null : Number(v) })
                    }}
                  >
                    Лимит
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const v = window.prompt("Пометка (клиент, сайт, заказ):", r.client_note)
                      if (v === null) return
                      act(`${r.id}:note`, { action: "update", id: r.id, note: v })
                    }}
                  >
                    Пометка
                  </Button>
                  {r.active_until && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm("Выключить помощника сейчас? Он перестанет отвечать на сайте клиента."))
                          act(`${r.id}:off`, { action: "update", id: r.id, active_until: new Date().toISOString() })
                      }}
                    >
                      Выключить
                    </Button>
                  )}
                  {r.mine && (
                    <Link href={`/template/edit/${r.id}`} className="ml-auto text-sm font-medium text-blue-700 underline">
                      Настроить ответы
                    </Link>
                  )}
                </div>

                <details>
                  <summary className="cursor-pointer text-sm text-gray-600">Код для сайта клиента</summary>
                  <div className="mt-3">
                    <EmbedCode id={r.id} />
                  </div>
                </details>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </AppShell>
  )
}
