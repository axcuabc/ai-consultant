import Link from "next/link"
import { Bot, Mail } from "lucide-react"
import { NICHES } from "@/lib/niches"
import { SIGNUP_PATH, SUPPORT_EMAIL } from "@/lib/site"

/** Простая шапка для страниц ниш, инструкций и т. п. */
export function SiteHeader() {
  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold text-gray-900">ИИ Консультант</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/auth" className="hidden text-sm font-medium text-gray-700 hover:text-blue-600 sm:inline">
            Войти
          </Link>
          <Link
            href={SIGNUP_PATH}
            className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white"
          >
            Создать бесплатно
          </Link>
        </div>
      </div>
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 px-4 py-10 text-sm text-gray-300 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 text-base font-semibold text-white">
            <Bot className="h-5 w-5" />
            ИИ Консультант
          </p>
          <p className="mt-2">Самозанятая Токарева Ангелина Алексеевна, ИНН 753613922473</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-2 flex items-center gap-2 hover:text-white">
            <Mail className="h-4 w-4" />
            {SUPPORT_EMAIL}
          </a>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Помощник для сайта</p>
          <ul className="space-y-1.5">
            {NICHES.map((n) => (
              <li key={n.slug}>
                <Link href={`/dlya/${n.slug}`} className="hover:text-white">
                  Для {n.forWhom}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Полезное</p>
          <ul className="space-y-1.5">
            <li>
              <Link href="/tilda" className="hover:text-white">
                Как поставить чат на Tilda
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Публичная оферта
              </Link>
            </li>
            <li>
              <Link href="/contacts" className="hover:text-white">
                Контакты и реквизиты
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}

/** Разметка schema.org для поисковиков. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
}
