"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

// Сюда ведёт ссылка из письма «Сменить пароль». Supabase сам открывает сессию по ссылке.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) return setError("Минимум 8 символов")
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) setError("Ссылка устарела или уже использована. Запросите новую на странице входа.")
    else router.replace("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Новый пароль</h1>
          <form onSubmit={save} className="space-y-4">
            <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Новый пароль" />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? "Сохраняю…" : "Сохранить и войти"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
