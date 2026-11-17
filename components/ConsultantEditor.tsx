"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppShell, Spinner, useAccount } from "@/components/account"
import EmbedCode from "@/components/EmbedCode"
import WidgetPreview from "@/components/WidgetPreview"
import { supabase } from "@/lib/supabase"
import { HEX_COLOR, emptyDraft, type ConsultantDraft } from "@/lib/consultant"
import { FONTS, ICONS, TEMPLATES, getTemplate, type WidgetFont, type WidgetIcon } from "@/lib/templates"

const COLOR_PRESETS = ["#4F46E5", "#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#111827"]
const ICON_LABELS: Record<WidgetIcon, string> = { chat: "Облачко", bot: "Робот", sparkle: "Искра", help: "Вопрос" }

const FIELDS: (keyof ConsultantDraft)[] = [
  "name", "category", "business_info", "contact_cta", "custom_prompt", "welcome_message",
  "theme_color", "icon", "position", "font", "allowed_domain",
]

function Field({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="font-medium text-gray-800">{label}</Label>
      {children}
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export default function ConsultantEditor({ id }: { id?: string }) {
  const router = useRouter()
  const { user, profile, loading } = useAccount()
  const [draft, setDraft] = useState<ConsultantDraft>(() => emptyDraft())
  const [loaded, setLoaded] = useState(!id)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!id || !user) return
    supabase
      .from("consultants")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          router.replace("/dashboard")
          return
        }
        const next = emptyDraft()
        for (const key of FIELDS) if (data[key] != null) (next as Record<string, unknown>)[key] = data[key]
        setDraft(next)
        setLoaded(true)
      })
  }, [id, user, router])

  const set = <K extends keyof ConsultantDraft>(key: K, value: ConsultantDraft[K]) => {
    setSaved(false)
    setDraft((d) => ({ ...d, [key]: value }))
  }

  const changeCategory = (category: string) => {
    setSaved(false)
    setDraft((d) => {
      const prev = getTemplate(d.category)
      const next = getTemplate(category)
      return {
        ...d,
        category,
        // Подставляем имя и приветствие из шаблона, только если их не меняли вручную
        name: d.name === prev.name || !d.name ? next.name : d.name,
        welcome_message: d.welcome_message === prev.welcome || !d.welcome_message ? next.welcome : d.welcome_message,
      }
    })
  }

  const preview = useMemo(
    () => ({
      id,
      name: draft.name,
      welcome: draft.welcome_message,
      color: HEX_COLOR.test(draft.theme_color) ? draft.theme_color : "#4F46E5",
      icon: draft.icon,
      position: draft.position,
      font: draft.font,
    }),
    [id, draft.name, draft.welcome_message, draft.theme_color, draft.icon, draft.position, draft.font],
  )

  const save = async () => {
    setError("")
    if (!draft.name.trim()) return setError("Укажите имя консультанта.")
    if (!HEX_COLOR.test(draft.theme_color)) return setError("Цвет должен быть в формате #RRGGBB.")
    if (!draft.business_info.trim()) return setError("Заполните данные о бизнесе: без них консультант будет отвечать общими словами.")
    setSaving(true)
    const payload = { ...draft, name: draft.name.trim(), allowed_domain: draft.allowed_domain.trim() }
    const result = id
      ? await supabase.from("consultants").update(payload).eq("id", id).select("id").single()
      : await supabase.from("consultants").insert({ ...payload, user_id: user!.id }).select("id").single()
    setSaving(false)
    if (result.error) {
      setError(
        result.error.message.includes("row-level security")
          ? "Не удалось сохранить: проверьте подписку или лимит консультантов."
          : `Не удалось сохранить: ${result.error.message}`,
      )
      return
    }
    setSaved(true)
    if (!id) router.replace(`/template/edit/${result.data.id}?created=1`)
  }

  if (loading || !loaded) {
    return (
      <AppShell>
        <Spinner />
      </AppShell>
    )
  }

  if (!profile) {
    return (
      <AppShell>
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-gray-700">Конструктор доступен после оплаты.</p>
            <Button onClick={() => router.push("/dashboard")}>В кабинет</Button>
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  const template = getTemplate(draft.category)

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 gap-2 px-0">
        <ArrowLeft className="h-4 w-4" />
        Назад в кабинет
      </Button>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">{id ? "Настройка консультанта" : "Новый консультант"}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">1. Содержание</h2>
              <Field label="Ниша" htmlFor="category" hint={template.limits ? `Ограничение шаблона: ${template.limits}` : undefined}>
                <select
                  id="category"
                  value={draft.category}
                  onChange={(e) => changeCategory(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </Field>
              <Field label="Имя консультанта" htmlFor="name">
                <Input id="name" maxLength={60} value={draft.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Приветствие" htmlFor="welcome" hint="Первое сообщение, которое видит посетитель.">
                <Input id="welcome" maxLength={300} value={draft.welcome_message} onChange={(e) => set("welcome_message", e.target.value)} />
              </Field>
              <Field
                label="Данные о бизнесе"
                htmlFor="info"
                hint="Услуги, цены, формат работы, адрес, частые вопросы. Консультант отвечает только по этим данным."
              >
                <Textarea
                  id="info"
                  rows={8}
                  maxLength={8000}
                  value={draft.business_info}
                  onChange={(e) => set("business_info", e.target.value)}
                  placeholder={"Например:\nКонсультация онлайн — 3000 ₽, 50 минут.\nРаботаю с тревогой, выгоранием, отношениями.\nЗапись на 1–2 недели вперёд."}
                />
              </Field>
              <Field label="Как записаться или связаться" htmlFor="cta" hint="Ссылка на запись, Telegram или телефон. Консультант будет вести сюда.">
                <Input id="cta" maxLength={500} value={draft.contact_cta} onChange={(e) => set("contact_cta", e.target.value)} placeholder="https://t.me/username" />
              </Field>
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-700">Дополнительные инструкции (необязательно)</summary>
                <Textarea
                  className="mt-2"
                  rows={4}
                  maxLength={3000}
                  value={draft.custom_prompt}
                  onChange={(e) => set("custom_prompt", e.target.value)}
                  placeholder="Например: обращайся на «вы», не упоминай конкурентов."
                />
              </details>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">2. Внешний вид</h2>
              <Field label="Цвет">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set("theme_color", c)}
                      className={`h-8 w-8 rounded-full border-2 ${draft.theme_color.toLowerCase() === c.toLowerCase() ? "border-gray-900" : "border-transparent"}`}
                      style={{ background: c }}
                      aria-label={`Цвет ${c}`}
                    />
                  ))}
                  <input
                    type="color"
                    value={HEX_COLOR.test(draft.theme_color) ? draft.theme_color : "#4F46E5"}
                    onChange={(e) => set("theme_color", e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded border"
                    aria-label="Свой цвет"
                  />
                  <Input value={draft.theme_color} onChange={(e) => set("theme_color", e.target.value)} className="w-28" maxLength={7} aria-label="Цвет в HEX" />
                </div>
              </Field>
              <Field label="Иконка">
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <Button key={icon} type="button" variant={draft.icon === icon ? "default" : "outline"} size="sm" onClick={() => set("icon", icon)}>
                      {ICON_LABELS[icon]}
                    </Button>
                  ))}
                </div>
              </Field>
              <Field label="Шрифт">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(FONTS) as WidgetFont[]).map((f) => (
                    <Button
                      key={f}
                      type="button"
                      variant={draft.font === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => set("font", f)}
                      style={{ fontFamily: FONTS[f].css }}
                    >
                      {FONTS[f].label}
                    </Button>
                  ))}
                </div>
              </Field>
              <Field label="Положение на странице">
                <div className="flex gap-2">
                  {(["right", "left"] as const).map((p) => (
                    <Button key={p} type="button" variant={draft.position === p ? "default" : "outline"} size="sm" onClick={() => set("position", p)}>
                      {p === "right" ? "Справа" : "Слева"}
                    </Button>
                  ))}
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">3. Защита</h2>
              <Field
                label="Домен сайта"
                htmlFor="domain"
                hint="Если указать, виджет будет отвечать только на этом сайте и его поддоменах. Пусто — на любом сайте."
              >
                <Input id="domain" maxLength={200} value={draft.allowed_domain} onChange={(e) => set("allowed_domain", e.target.value)} placeholder="mysite.ru" />
              </Field>
            </CardContent>
          </Card>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button onClick={save} disabled={saving} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-base">
            <Save className="h-5 w-5" />
            {saving ? "Сохраняю…" : saved ? "Сохранено" : id ? "Сохранить изменения" : "Создать консультанта"}
          </Button>

          {id && (
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold">Код для сайта</h2>
                <EmbedCode id={id} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <WidgetPreview config={preview} />
          {!id && <p className="mt-2 text-xs text-gray-500">Настоящие ответы ИИ появятся в предпросмотре после сохранения.</p>}
        </div>
      </div>
    </AppShell>
  )
}
