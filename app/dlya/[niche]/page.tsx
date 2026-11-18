import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Check, Code, MessageCircle, ShieldCheck, Sparkles, X } from "lucide-react"
import { JsonLd, SiteFooter, SiteHeader } from "@/components/SiteChrome"
import { NICHES, getNiche } from "@/lib/niches"
import { getTemplate } from "@/lib/templates"
import { PLAN, formatRub } from "@/lib/plans"
import { SIGNUP_PATH, SITE_URL } from "@/lib/site"

export function generateStaticParams() {
  return NICHES.map((n) => ({ niche: n.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ niche: string }> }): Promise<Metadata> {
  const n = getNiche((await params).niche)
  if (!n) return {}
  return {
    title: n.title,
    description: n.description,
    alternates: { canonical: `/dlya/${n.slug}` },
    openGraph: { title: n.title, description: n.description, url: `/dlya/${n.slug}`, type: "website", locale: "ru_RU", images: ["/og.jpg"] },
  }
}

const STEPS = [
  { icon: Sparkles, title: "Опишите услуги", text: "Выберите нишу — правила ответов и пример описания уже готовы. Замените данные на свои." },
  { icon: MessageCircle, title: "Проверьте бесплатно", text: "Задайте помощнику вопросы как клиент прямо в кабинете. Карта не нужна." },
  { icon: Code, title: "Поставьте на сайт", text: "Оплатите подписку и вставьте одну строку кода в Tilda или любой конструктор." },
]

export default async function NichePage({ params }: { params: Promise<{ niche: string }> }) {
  const n = getNiche((await params).niche)
  if (!n) notFound()
  const template = getTemplate(n.templateId)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: n.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "ИИ Консультант", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: n.h1, item: `${SITE_URL}/dlya/${n.slug}` },
          ],
        }}
      />
      <SiteHeader />

      <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-4xl" aria-hidden>
              {n.emoji}
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{n.h1}</h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-600">{n.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={SIGNUP_PATH}
                className="inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-7 text-base font-medium text-white shadow-lg"
              >
                Создать помощника бесплатно
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/#demo"
                className="inline-flex h-12 items-center justify-center rounded-md border border-gray-200 bg-white px-7 text-base font-medium text-gray-800"
              >
                Попробовать демо
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">Карта не нужна · Проверка бесплатно · Без автосписаний</p>
          </div>

          <div className="mx-auto w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
            <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white">
              Пример диалога на сайте {n.forWhom}
            </div>
            <div className="space-y-2 p-4 text-sm leading-snug">
              {n.dialog.map((m, i) => (
                <p
                  key={i}
                  className={`w-fit max-w-[88%] rounded-xl px-3 py-2 ${
                    m.from === "client" ? "ml-auto bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Знакомо?</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {n.pains.map((p) => (
              <div key={p} className="rounded-2xl bg-gray-50 p-6 text-gray-700">
                <X className="mb-3 h-6 w-6 text-rose-500" />
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Что делает помощник</h2>
            <ul className="space-y-3 text-gray-700">
              {[
                "Отвечает на вопросы об услугах, ценах и формате — по вашему описанию",
                "Приглашает записаться и даёт вашу ссылку или контакт",
                "Работает круглосуточно и отвечает на языке посетителя",
                "Выглядит в цветах вашего сайта",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Правила для этой ниши</h2>
            <p className="flex gap-3 text-gray-700">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              {template.note || "Помощник отвечает только по вашему описанию и не придумывает цены и услуги."}
            </p>
            <p className="mt-3 flex gap-3 text-gray-700">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              Не придумывает цены и услуги: если ответа нет в описании, предлагает связаться с вами.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold">Как подключить</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="rounded-2xl border border-gray-200 p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-gray-400">Шаг {i + 1}</p>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-gray-600">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-gray-600">
            Ставите на Tilda? <Link href="/tilda" className="text-blue-600 underline">Пошаговая инструкция для Tilda</Link>
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-purple-50 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Сколько стоит</h2>
          <p className="mt-4 text-lg text-gray-700">
            Создание и проверка — бесплатно. Работа на сайте — {formatRub(PLAN.startPrice)} за первый месяц, дальше{" "}
            {formatRub(PLAN.renewPrice)} за {PLAN.periodDays} дней. Без автосписаний, ответы ИИ включены.
          </p>
          <Link
            href={SIGNUP_PATH}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-8 text-base font-medium text-white shadow-lg"
          >
            Создать помощника для {n.forWhom}
          </Link>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-bold">Вопросы</h2>
          <div className="space-y-3">
            {n.faq.map((f) => (
              <details key={f.q} className="group rounded-xl bg-gray-50 p-5">
                <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
                <p className="mt-3 text-gray-600">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-gray-600">
            Другие ниши:{" "}
            {NICHES.filter((x) => x.slug !== n.slug).map((x, i, arr) => (
              <span key={x.slug}>
                <Link href={`/dlya/${x.slug}`} className="text-blue-600 hover:underline">
                  {x.forWhom}
                </Link>
                {i < arr.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
