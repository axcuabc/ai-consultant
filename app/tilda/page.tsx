import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { JsonLd, SiteFooter, SiteHeader } from "@/components/SiteChrome"
import { NICHES } from "@/lib/niches"
import { PLAN, formatRub } from "@/lib/plans"
import { SIGNUP_PATH } from "@/lib/site"

const TITLE = "ИИ-чат для сайта на Tilda: как поставить за 2 минуты без кода"
const DESCRIPTION =
  "Пошаговая инструкция: как добавить ИИ-помощника в чат сайта на Tilda через блок T123. Отвечает клиентам 24/7 о ценах и услугах. Проверка бесплатно."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tilda" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/tilda", type: "article", locale: "ru_RU", images: ["/og.jpg"] },
}

const STEPS = [
  {
    title: "Создайте помощника",
    text: "Зарегистрируйтесь на сайте (карта не нужна), выберите нишу и вставьте описание своих услуг. Проверьте ответы прямо в кабинете — это бесплатно.",
  },
  {
    title: "Включите подписку и скопируйте код",
    text: `После оплаты (${formatRub(PLAN.startPrice)} за первый месяц) в кабинете появится одна строка кода. Нажмите кнопку копирования рядом с ней.`,
  },
  {
    title: "Добавьте блок T123 в Tilda",
    text: "Откройте нужную страницу в редакторе Tilda → «Добавить блок» → категория «Другое» → блок T123 «HTML-код». Нажмите «Контент» и вставьте скопированную строку. Блок можно поставить в любое место страницы — чат всё равно появится в углу.",
  },
  {
    title: "Опубликуйте страницу",
    text: "Нажмите «Опубликовать». Откройте сайт — в правом нижнем углу появится кнопка чата. Чтобы чат был на всех страницах, вставьте код в «Настройки сайта → Ещё → HTML-код для вставки внутрь HEAD».",
  },
]

const FAQ = [
  {
    q: "Нужен ли платный тариф Tilda?",
    a: "Да. Вставлять свой HTML-код (блок T123 или код в HEAD) Tilda разрешает на платных тарифах. На бесплатном тарифе блок T123 недоступен.",
  },
  {
    q: "Почему чат не появился после вставки?",
    a: "Проверьте три вещи: страница опубликована после вставки кода, подписка в кабинете активна, а в настройках помощника в поле «Адрес сайта» указан именно ваш домен (или поле пустое). В редакторе Tilda чат не отображается — только на опубликованном сайте.",
  },
  {
    q: "Замедлит ли чат мой сайт?",
    a: "Нет. Скрипт загружается асинхронно, после основного содержимого страницы, и весит около 13 килобайт.",
  },
  {
    q: "Можно ли поменять цвет под дизайн сайта?",
    a: "Да, в кабинете выбираются цвет, иконка, шрифт и положение чата. Код на сайте менять не нужно — изменения появятся сами.",
  },
]

export default function TildaPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: TITLE,
          description: DESCRIPTION,
          step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <SiteHeader />

      <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <h1 className="text-4xl font-bold leading-tight">{TITLE}</h1>
        <p className="mt-5 text-lg leading-relaxed text-gray-600">
          ИИ-помощник отвечает посетителям вашего сайта на Tilda о ценах, услугах и формате работы и приглашает записаться — днём и
          ночью. Установка — одна строка кода в блоке T123, программировать не нужно.
        </p>

        <ol className="mt-10 space-y-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold">{s.title}</h2>
                <p className="mt-1 text-gray-700">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-2xl bg-gray-900 p-5 text-sm text-gray-100">
          <p className="mb-2 text-gray-400">Так выглядит код (ваш будет со своим номером):</p>
          <code className="break-all">{'<script src="https://www.ai-consultant.site/widget.js" data-id="ваш-номер" async></script>'}</code>
        </div>

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 text-center">
          <p className="text-lg font-semibold">Попробуйте до установки</p>
          <p className="mt-2 text-gray-600">Создайте помощника и проверьте, как он отвечает, — бесплатно и без карты.</p>
          <Link
            href={SIGNUP_PATH}
            className="mt-5 inline-flex h-12 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-7 font-medium text-white"
          >
            Создать бесплатно
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <h2 className="mt-14 text-2xl font-bold">Частые вопросы</h2>
        <div className="mt-4 space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-xl bg-gray-50 p-5">
              <summary className="cursor-pointer list-none font-semibold">{f.q}</summary>
              <p className="mt-3 text-gray-600">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-10 text-gray-600">
          Готовые настройки для ниш:{" "}
          {NICHES.map((n, i) => (
            <span key={n.slug}>
              <Link href={`/dlya/${n.slug}`} className="text-blue-600 hover:underline">
                для {n.forWhom}
              </Link>
              {i < NICHES.length - 1 ? ", " : ""}
            </span>
          ))}
          .
        </p>
      </article>

      <SiteFooter />
    </div>
  )
}
