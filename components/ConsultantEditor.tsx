"use client"

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, MessageCircle, RotateCcw, Save, Settings2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AppShell, Spinner, subscriptionStatus, useAccount } from "@/components/account"
import EmbedCode from "@/components/EmbedCode"
import WidgetPreview, { type WidgetHandle } from "@/components/WidgetPreview"
import { supabase } from "@/lib/supabase"
import { PLAN, formatRub } from "@/lib/plans"
import { HEX_COLOR, emptyDraft, type ConsultantDraft } from "@/lib/consultant"
import { FONTS, ICONS, TEMPLATES, getTemplate, type WidgetFont, type WidgetIcon } from "@/lib/templates"

const COLOR_PRESETS = ["#4F46E5", "#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#111827"]
const ICON_LABELS: Record<WidgetIcon, string> = { chat: "Облачко", bot: "Робот", sparkle: "Искра", help: "Вопрос" }

// Поля, от которых зависят ответы ИИ: пока они не сохранены, тестовый чат отвечает по старой версии
const CONTENT_FIELDS: (keyof ConsultantDraft)[] = ["name", "category", "business_info", "contact_cta", "custom_prompt"]
const contentKey = (d: ConsultantDraft) => JSON.stringify(CONTENT_FIELDS.map((k) => d[k]))

function Choice({ active, onClick, children, style }: { active: boolean; onClick: () => void; children: ReactNode; style?: CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
        active ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
      }`}
    >
      {children}
    </button>
  )
}

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
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [tab, setTab] = useState<"setup" | "test">("setup")
  const [justCreated, setJustCreated] = useState(false)
  const widget = useRef<WidgetHandle | null>(null)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("created") === "1") {
      setJustCreated(true)
      setTab("test")
    }
  }, [])

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
        setSavedKey(contentKey(next))
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
          ? `Не удалось сохранить: на одном аккаунте можно создать до ${PLAN.maxConsultants} консультантов.`
          : `Не удалось сохранить: ${result.error.message}`,
      )
      return
    }
    setSaved(true)
    setSavedKey(contentKey(draft))
    if (!id) router.replace(`/template/edit/${result.data.id}?created=1`)
  }

  if (loading || !loaded) {
    return (
      <AppShell>
        <Spinner />
      </AppShell>
    )
  }

  const template = getTemplate(draft.category)
  const dirty = Boolean(id) && savedKey !== null && contentKey(draft) !== savedKey
  const active = subscriptionStatus(profile) === "active"

  const insertExample = () => {
    if (draft.business_info.trim() && !window.confirm("Заменить текущее описание примером?")) return
    set("business_info", template.example)
  }

  const ask = (q: string) => {
    setTab("test")
    widget.current?.ask?.(q)
  }

  const markTested = () => {
    if (!id) return
    try {
      localStorage.setItem(`aic:tested:${id}`, "1")
    } catch {
      /* хранилище недоступно */
    }
  }

  const saveButton = (
    <Button onClick={save} disabled={saving} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-base shadow-lg">
      <Save className="h-5 w-5" />
      {saving ? "Сохраняю…" : saved && !dirty ? "Сохранено" : id ? "Сохранить изменения" : "Создать консультанта"}
    </Button>
  )

  return (
    <AppShell>
      <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 gap-2 px-0">
        <ArrowLeft className="h-4 w-4" />
        Назад в кабинет
      </Button>
      <h1 className="mb-4 text-3xl font-bold text-gray-900">{id ? draft.name || "Консультант" : "Новый консультант"}</h1>

      {justCreated && (
        <div className="mb-4 flex gap-3 rounded-lg bg-green-50 p-4 text-sm text-green-900">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <span>Консультант создан! Задайте ему пару вопросов так, как спросил бы ваш клиент, и посмотрите, как он отвечает.</span>
        </div>
      )}

      {id && (
        <div className="mb-4 grid grid-cols-2 rounded-lg bg-gray-100 p-1 lg:hidden">
          {([
            ["setup", "Настройка", Settings2],
            ["test", "Проверка", MessageCircle],
          ] as const).map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium ${
                tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className={`min-w-0 space-y-6 ${id && tab === "test" ? "hidden lg:block" : ""}`}>
          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">1. О вас и ваших услугах</h2>
              <Field label="Ниша" htmlFor="category" hint={template.note || undefined}>
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
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label htmlFor="info" className="font-medium text-gray-800">Описание услуг</Label>
                  <button type="button" onClick={insertExample} className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                    <Wand2 className="h-4 w-4" />
                    Вставить пример
                  </button>
                </div>
                <Textarea
                  id="info"
                  rows={10}
                  maxLength={8000}
                  value={draft.business_info}
                  onChange={(e) => set("business_info", e.target.value)}
                  placeholder={"Чем вы занимаетесь, услуги и цены, формат работы, сроки, частые вопросы клиентов.\n\nНажмите «Вставить пример» — и замените в нём данные на свои."}
                />
                <p className="text-xs text-gray-500">
                  Консультант отвечает только по этому описанию и не придумывает цены. Чем подробнее — тем лучше ответы.
                </p>
              </div>
              <Field label="Как записаться или связаться" htmlFor="cta" hint="Сюда консультант будет приглашать клиентов: ссылка на запись, Telegram или телефон.">
                <Input id="cta" maxLength={500} value={draft.contact_cta} onChange={(e) => set("contact_cta", e.target.value)} placeholder="Например: запись в Telegram @username" />
              </Field>
              <Field label="Имя в чате" htmlFor="name" hint="Так подписан чат на сайте.">
                <Input id="name" maxLength={60} value={draft.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label="Приветствие" htmlFor="welcome" hint="Первое сообщение, которое видит посетитель.">
                <Input id="welcome" maxLength={300} value={draft.welcome_message} onChange={(e) => set("welcome_message", e.target.value)} />
              </Field>
              <details>
                <summary className="cursor-pointer text-sm font-medium text-gray-700">Особые пожелания к ответам (необязательно)</summary>
                <Textarea
                  className="mt-2"
                  rows={4}
                  maxLength={3000}
                  value={draft.custom_prompt}
                  onChange={(e) => set("custom_prompt", e.target.value)}
                  placeholder="Например: обращайся на «вы», отвечай коротко, не упоминай конкурентов."
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
                      className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${draft.theme_color.toLowerCase() === c.toLowerCase() ? "ring-blue-600" : "ring-transparent"}`}
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
              <Field label="Иконка кнопки">
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((icon) => (
                    <Choice key={icon} active={draft.icon === icon} onClick={() => set("icon", icon)}>
                      {ICON_LABELS[icon]}
                    </Choice>
                  ))}
                </div>
              </Field>
              <Field label="Шрифт">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(FONTS) as WidgetFont[]).map((f) => (
                    <Choice key={f} active={draft.font === f} onClick={() => set("font", f)} style={{ fontFamily: FONTS[f].css }}>
                      {FONTS[f].label}
                    </Choice>
                  ))}
                </div>
              </Field>
              <Field label="Где на странице">
                <div className="flex gap-2">
                  {(["right", "left"] as const).map((p) => (
                    <Choice key={p} active={draft.position === p} onClick={() => set("position", p)}>
                      {p === "right" ? "Справа внизу" : "Слева внизу"}
                    </Choice>
                  ))}
                </div>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <h2 className="text-lg font-semibold">3. Ваш сайт</h2>
              <Field
                label="Адрес сайта (необязательно)"
                htmlFor="domain"
                hint="Если указать, консультант будет работать только на вашем сайте, и ваш код не получится поставить на чужой."
              >
                <Input id="domain" maxLength={200} value={draft.allowed_domain} onChange={(e) => set("allowed_domain", e.target.value)} placeholder="mysite.ru" />
              </Field>
            </CardContent>
          </Card>

          {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="sticky bottom-4 z-10 lg:static">{saveButton}</div>

          {id && (
            <Card>
              <CardContent className="space-y-3 p-6">
                <h2 className="text-lg font-semibold">Код для сайта</h2>
                {active ? (
                  <EmbedCode id={id} />
                ) : (
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>Код появится после оплаты. А пока проверьте консультанта во вкладке «Проверка»: задайте ему вопросы как клиент.</p>
                    <Button onClick={() => router.push("/payment")} className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      Включить на сайте — {formatRub(PLAN.startPrice)}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className={`space-y-3 lg:sticky lg:top-24 lg:self-start ${id && tab === "setup" ? "hidden lg:block" : ""} ${!id ? "hidden lg:block" : ""}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Проверка</h2>
            {id && (
              <button onClick={() => widget.current?.reset?.()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
                <RotateCcw className="h-4 w-4" />
                Очистить чат
              </button>
            )}
          </div>
          {id ? (
            <>
              {dirty ? (
                <div className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                  <p>Есть несохранённые изменения. Сохраните их, чтобы консультант отвечал по новому описанию.</p>
                  <Button size="sm" onClick={save} disabled={saving} className="bg-amber-600 hover:bg-amber-700">
                    {saving ? "Сохраняю…" : "Сохранить"}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {template.questions.map((q) => (
                    <button
                      key={q}
                      onClick={() => ask(q)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">Сохраните консультанта, и здесь можно будет задать ему вопросы.</p>
          )}
          <WidgetPreview config={preview} apiRef={widget} onSend={markTested} height="h-[560px]" />
          {id && !active && (
            <p className="text-xs text-gray-500">До оплаты консультант отвечает только здесь — до 30 сообщений в сутки.</p>
          )}
        </div>
      </div>
    </AppShell>
  )
}
