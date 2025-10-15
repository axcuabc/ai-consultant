import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Контакты и реквизиты | ИИ Консультант",
  description:
    "Контактная информация и реквизиты ИП Токарева Ангелина Алексеевна. Техническая поддержка ИИ-Консультант",
}

export default function ContactsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
