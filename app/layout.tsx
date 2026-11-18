import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react" // <= обязательно `react`, не `next`

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "ИИ-помощник в чат сайта для психологов, нутрициологов и специалистов — ИИ Консультант",
  description:
    "Помощник в чате вашего сайта отвечает клиентам 24/7 о ценах и услугах и приводит к записи. Создание и проверка бесплатно, от 990 ₽ в месяц. Работает на Tilda, без программирования.",
  keywords: "ИИ консультант, чат-бот для сайта, ИИ для Tilda, онлайн-консультант, автоматизация заявок",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://your-domain.vercel.app"),
  openGraph: {
    title: "ИИ Консультант для сайта",
    description: "Помощник в чате сайта отвечает клиентам 24/7 и приводит к записи. Попробуйте бесплатно.",
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