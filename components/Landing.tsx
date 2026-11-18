"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Clock,
  Code,
  Lock,
  Menu,
  MessageCircle,
  MessagesSquare,
  MoonStar,
  Palette,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserX,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import DemoConsultant from "@/components/DemoConsultant"
import SiteAssistant from "@/components/SiteAssistant"
import { DEMOS } from "@/lib/demo"
import { TEMPLATES } from "@/lib/templates"
import { nicheForTemplate } from "@/lib/niches"
import { SiteFooter } from "@/components/SiteChrome"
import { PLAN, formatRub } from "@/lib/plans"
import { FAQ } from "@/lib/landing"

const SIGNUP = "/auth?mode=signup"
const SUPPORT = "ai.consultant.site@gmail.com"

const NAV = [
  { id: "how", label: "Как это работает" },
  { id: "demo", label: "Демо" },
  { id: "pricing", label: "Цены" },
  { id: "faq", label: "Вопросы" },
]

const NICHE_ICONS: Record<string, string> = {
  psychologist: "🧠",
  finance: "💰",
  nutrition: "🥗",
  designer: "🎨",
  beauty: "💅",
  school: "🎓",
  travel: "🌴",
  other: "✨",
}

const DEMO_TABS: Record<string, string> = { psychology: "Психолог", diet: "Нутрициолог", design: "Дизайнер" }

const PAINS = [
  {
    icon: MoonStar,
    title: "Пишут ночью и в выходные",
    text: "Вы отвечаете утром — а человек уже записался к тому, кто ответил сразу.",
  },
  {
    icon: MessagesSquare,
    title: "Одни и те же вопросы",
    text: "«Сколько стоит?», «Как проходит?», «Есть ли время?» — по десять раз в неделю.",
  },
  {
    icon: UserX,
    title: "Уходят молча",
    text: "Зашли на сайт, не нашли ответ за минуту и закрыли вкладку. Вы даже не узнаете о них.",
  },
]

const STEPS = [
  {
    icon: Sparkles,
    title: "Расскажите о своих услугах",
    text: "Выберите нишу и вставьте описание: услуги, цены, формат. Есть готовый пример — замените в нём данные на свои.",
  },
  {
    icon: MessageCircle,
    title: "Проверьте ответы бесплатно",
    text: "Задайте помощнику вопросы так, как спросил бы клиент. Поправьте описание, если что-то не нравится.",
  },
  {
    icon: Code,
    title: "Поставьте на сайт",
    text: "Оплатите подписку и вставьте одну строку кода в Tilda или любой конструктор. Это 2 минуты.",
  },
]

const CAN = [
  "Отвечает на вопросы об услугах, ценах, формате и сроках",
  "Приглашает записаться и даёт вашу ссылку или контакт",
  "Работает круглосуточно, в том числе ночью и в выходные",
  "Отвечает на языке посетителя",
  "Выглядит в цветах вашего сайта",
]

const CANNOT = [
  "Не придумывает цены и услуги — говорит только то, что вы написали",
  "Не ставит диагнозы и не составляет планы лечения или питания",
  "Не обещает свободное время для записи — отправляет к вам",
  "Не выдаёт себя за вас: представляется вашим помощником",
]


function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
      <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-gray-600">{subtitle}</p>}
    </div>
  )
}

/** Макет сайта специалиста с открытым чатом помощника. */
function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-2xl" aria-hidden />
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-300" />
          <span className="h-3 w-3 rounded-full bg-amber-300" />
          <span className="h-3 w-3 rounded-full bg-green-300" />
          <span className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-xs text-gray-400">anna-psychologist.ru</span>
        </div>
        <div className="relative h-[29rem] bg-gradient-to-br from-rose-50 to-white p-6 sm:h-[27rem]">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">Психолог</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">Анна Смирнова</p>
          <div className="mt-3 space-y-2" aria-hidden>
            <div className="h-2.5 w-3/4 rounded bg-gray-200" />
            <div className="h-2.5 w-2/3 rounded bg-gray-200" />
            <div className="h-2.5 w-1/2 rounded bg-gray-200" />
          </div>
          <div className="absolute bottom-4 right-4 w-[85%] max-w-xs overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200">
            <div className="flex items-center gap-2 bg-rose-500 px-4 py-3 text-sm font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-green-300" />
              Помощник Анны
            </div>
            <div className="space-y-2 p-3 text-[13px] leading-snug">
              <p className="ml-auto w-fit max-w-[85%] rounded-xl bg-rose-500 px-3 py-2 text-white">Сколько стоит первая консультация?</p>
              <p className="w-fit max-w-[90%] rounded-xl bg-gray-100 px-3 py-2 text-gray-800">
                Первая встреча — 3 000 ₽, 50 минут онлайн. Можно просто прийти и рассказать, что беспокоит. Подсказать, как записаться?
              </p>
              <p className="ml-auto w-fit max-w-[85%] rounded-xl bg-rose-500 px-3 py-2 text-white">Да, давайте</p>
              <p className="w-fit max-w-[90%] rounded-xl bg-gray-100 px-3 py-2 text-gray-800">
                Напишите Анне в Telegram @anna_psy — она подберёт удобное время.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -left-2 top-1/2 hidden rounded-xl bg-white px-4 py-3 text-sm shadow-xl ring-1 ring-gray-100 sm:block">
        <p className="flex items-center gap-2 font-medium text-gray-900">
          <Clock className="h-4 w-4 text-blue-600" />
          02:14 ночи
        </p>
        <p className="text-xs text-gray-500">ответ за 3 секунды</p>
      </div>
    </div>
  )
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [demoId, setDemoId] = useState(DEMOS[0].id)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const demo = DEMOS.find((d) => d.id === demoId) ?? DEMOS[0]

  const go = (id: string) => {
    scrollTo(id)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Шапка */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-gray-200/60 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bot className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold">ИИ Консультант</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => go(item.id)} className="text-sm text-gray-600 hover:text-blue-600">
                {item.label}
              </button>
            ))}
            <Link href="/auth" className="text-sm font-medium text-gray-700 hover:text-blue-600">
              Войти
            </Link>
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href={SIGNUP}>Создать бесплатно</Link>
            </Button>
          </div>
          <button className="p-2 md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Меню">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {menuOpen && (
          <div className="space-y-1 border-t bg-white px-4 py-4 md:hidden">
            {NAV.map((item) => (
              <button key={item.id} onClick={() => go(item.id)} className="block w-full py-2 text-left text-gray-700">
                {item.label}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/auth">Войти</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Link href={SIGNUP}>Создать</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Первый экран */}
      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 pb-16 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-3 py-1 text-sm text-gray-600 shadow-sm ring-1 ring-gray-200">
              Для психологов, нутрициологов, дизайнеров и других специалистов
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
              Помощник в чате сайта, который{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                отвечает клиентам 24/7
              </span>{" "}
              и приводит их к записи
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">
              Расскажите о своих услугах — помощник ответит посетителям о ценах и формате работы и пригласит записаться. Работает на
              Tilda и любом сайте, без программирования.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 px-7 text-base shadow-lg">
                <Link href={SIGNUP}>
                  Создать бесплатно
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("demo")} className="h-12 bg-white px-7 text-base">
                Посмотреть, как отвечает
              </Button>
            </div>
            <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                Карта не нужна
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                Проверка бесплатно
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-600" />
                Без автосписаний
              </span>
            </p>
          </div>
          <HeroMockup />
        </div>
      </section>

      {/* Боль */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle title="Знакомо?" subtitle="Клиенты не ждут ответа — они идут туда, где ответили быстрее" />
          <div className="grid gap-4 md:grid-cols-3">
            {PAINS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl bg-gray-50 p-6">
                <Icon className="h-8 w-8 text-purple-600" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-center text-lg text-gray-700">
            Помощник отвечает сразу — днём и ночью — и передаёт вам уже тёплого клиента, который знает цены и готов записаться.
          </p>
        </div>
      </section>

      {/* Как это работает */}
      <section id="how" className="scroll-mt-16 bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionTitle title="Как это работает" subtitle="Три шага, около 10 минут" />
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-gray-400">Шаг {i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Демо */}
      <section id="demo" className="scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionTitle title="Задайте вопрос как клиент" subtitle="Так помощник ответит вашим посетителям. Специалисты в примерах вымышленные." />
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-gray-100 p-1">
            {DEMOS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDemoId(d.id)}
                className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
                  d.id === demo.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span aria-hidden>{d.avatar}</span>
                {DEMO_TABS[d.id] ?? d.title}
              </button>
            ))}
          </div>
          <DemoConsultant key={demo.id} demo={demo} />
          <div className="mt-6 text-center">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Link href={SIGNUP}>Создать такого для себя — бесплатно</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Что умеет и чего не делает */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle title="Честно о том, что умеет помощник" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-green-700">Умеет</h3>
              <ul className="space-y-3">
                {CAN.map((t) => (
                  <li key={t} className="flex gap-3 text-gray-700">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Не делает</h3>
              <ul className="space-y-3">
                {CANNOT.map((t) => (
                  <li key={t} className="flex gap-3 text-gray-700">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Ниши */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionTitle title="Готовые настройки для вашей ниши" subtitle="Правила ответов и пример описания услуг уже подготовлены" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TEMPLATES.map((t) => {
              const page = nicheForTemplate(t.id)
              const body = (
                <>
                  <div className="text-3xl" aria-hidden>
                    {NICHE_ICONS[t.id] ?? "✨"}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900">{t.id === "other" ? "Любая другая" : t.title}</p>
                </>
              )
              return page ? (
                <Link
                  key={t.id}
                  href={`/dlya/${page.slug}`}
                  className="rounded-xl border border-gray-200 p-4 text-center transition-colors hover:border-blue-300 hover:bg-blue-50"
                >
                  {body}
                </Link>
              ) : (
                <div key={t.id} className="rounded-xl border border-gray-200 p-4 text-center">
                  {body}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Цены */}
      <section id="pricing" className="scroll-mt-16 bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <SectionTitle title="Простая цена" subtitle="Меньше, чем стоит одна консультация в месяц" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Создание и проверка</p>
              <p className="mt-2 text-3xl font-bold">0 ₽</p>
              <p className="mt-2 text-sm text-gray-600">Настройте помощника и проверьте его ответы в кабинете. Карта не нужна.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-lg ring-2 ring-blue-500">
              <p className="text-sm font-medium text-blue-600">Первый месяц на сайте</p>
              <p className="mt-2 text-3xl font-bold">{formatRub(PLAN.startPrice)}</p>
              <p className="mt-2 text-sm text-gray-600">Подключение и {PLAN.periodDays} дней работы на вашем сайте.</p>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-500">Дальше</p>
              <p className="mt-2 text-3xl font-bold">
                {formatRub(PLAN.renewPrice)}
                <span className="text-base font-normal text-gray-500"> / {PLAN.periodDays} дней</span>
              </p>
              <p className="mt-2 text-sm text-gray-600">Продлеваете сами, когда удобно.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 rounded-2xl bg-white p-6 text-sm text-gray-700 shadow-sm sm:grid-cols-2">
            {[
              [Sparkles, "Ответы ИИ включены в цену — свои ключи не нужны"],
              [Palette, `До ${PLAN.maxConsultants} помощников на аккаунт, свои цвета и шрифт`],
              [RotateCcw, "Без автосписаний и привязки карты"],
              [Lock, "Оплата через ЮKassa, возврат за неиспользованные дни"],
            ].map(([Icon, text]) => {
              const I = Icon as typeof Sparkles
              return (
                <p key={text as string} className="flex gap-3">
                  <I className="h-5 w-5 shrink-0 text-blue-600" />
                  {text as string}
                </p>
              )
            })}
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="h-12 bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base shadow-lg">
              <Link href={SIGNUP}>
                Создать бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-3 text-sm text-gray-500">Если подписка закончится, чат на сайте скроется, а все настройки сохранятся.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-16 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionTitle title="Частые вопросы" />
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={item.q} className="overflow-hidden rounded-xl bg-gray-50">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold"
                  aria-expanded={openFaq === i}
                >
                  {item.q}
                  <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && <p className="px-5 pb-5 text-gray-600">{item.a}</p>}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-gray-600">
            Остались вопросы? Спросите помощника в правом нижнем углу или напишите на{" "}
            <a href={`mailto:${SUPPORT}`} className="text-blue-600 underline">
              {SUPPORT}
            </a>
            .
          </p>
        </div>
      </section>

      <SiteFooter />

      <SiteAssistant />
    </div>
  )
}
