import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react" // <= обязательно `react`, не `next`

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "ИИ Консультант для сайта | Добавь ChatGPT на свой сайт за 10 минут",
  description:
    "Готовый код для интеграции ИИ-консультанта на любой сайт. Без программирования. Работает на Tilda, WordPress и других платформах. Разовая оплата 990₽.",
  keywords: "ИИ консультант, ChatGPT для сайта, чатбот, автоматизация, Tilda, WordPress",
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