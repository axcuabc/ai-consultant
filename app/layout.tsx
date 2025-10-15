import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "ИИ Консультант для сайта | Добавь ChatGPT на свой сайт за 10 минут",
  description:
    "Готовый код для интеграции ИИ-консультанта на любой сайт. Без программирования. Работает на Tilda, WordPress и других платформах. Разовая оплата 990₽.",
  keywords: "ИИ консультант, ChatGPT для сайта, чатбот, автоматизация, Tilda, WordPress",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
