import { redirect } from "next/navigation"

// Старый адрес кабинета. Оставлен, чтобы работали ссылки из старых писем.
export default function ProfilePage() {
  redirect("/dashboard")
}
