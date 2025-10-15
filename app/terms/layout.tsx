import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Пользовательское соглашение | ИИ Консультант",
  description: "Условия использования сервиса ИИ-Консультант для интеграции искусственного интеллекта на сайты",
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
