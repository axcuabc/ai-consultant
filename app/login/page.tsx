"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, KeyRound, CheckCircle, Shield, Clock } from "lucide-react"

export default function LoginPage() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError("Неверный или истекший код доступа.")
        return
      }

      // ✅ Сохраняем сессию (если хочешь — email и т.д.)
      localStorage.setItem("access_code", code)
      localStorage.setItem("user_email", data.email)

      // 🌍 Перенаправляем на отдельную платформу
      window.location.href = "https://ai-consultant-platform.vercel.app"
    } catch (err) {
      setError("Ошибка сервера. Попробуйте позже.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Вход по коду доступа</CardTitle>
          <p className="text-gray-500">Введите код, который вы получили после оплаты</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800 mt-2">
              Код высылается на вашу почту после успешной оплаты
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm text-gray-700">
                Код доступа
              </Label>
              <Input
                id="code"
                type="text"
                placeholder="Введите ваш код"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="bg-white border-gray-300 text-gray-900 uppercase tracking-widest text-center"
                required
              />
            </div>

            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading ? "Проверка..." : "Войти"}
            </Button>
          </form>

          <div className="text-gray-400 text-xs text-center space-y-1">
            <p>После входа вы получите:</p>
            <ul className="mt-2 space-y-1 text-left max-w-xs mx-auto">
              <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Доступ к панели управления</li>
              <li className="flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-500" /> 30 дней использования</li>
              <li className="flex items-center"><Shield className="w-4 h-4 mr-2 text-purple-500" /> Безопасное хранение данных</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
