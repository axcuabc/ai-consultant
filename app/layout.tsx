import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react" // <= обязательно `react`, не `next`

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "ИИ-консультант для сайта на Tilda — отвечает клиентам 24/7",
  description:
    "ИИ-консультант для сайта: выберите нишу, заполните данные о бизнесе и вставьте одну строку кода. Работает на Tilda и любых сайтах. Без программирования.",
  keywords: "ИИ консультант, чат-бот для сайта, ИИ для Tilda, онлайн-консультант, автоматизация заявок",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.vercel.app"),
  openGraph: {
    title: "ИИ Консультант для сайта",
    description: "Добавь ИИ-консультанта на свой сайт за 10 минут. Без программирования.",
    type: "website",
    locale: "ru_RU",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        {children}
        <Analytics /> {/* <-- вот это добавляем */}
      </body>
    </html>
  )
}