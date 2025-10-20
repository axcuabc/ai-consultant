"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Lock, Mail, Eye, EyeOff, Shield, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError("Неверный или просроченный код.")
        return
      }

      // Сохраняем токен и email локально
      localStorage.setItem("userEmail", data.email)
      localStorage.setItem("userCode", password)

      // ✅ Перенаправление на защищённый сайт
      window.location.href = "https://platform.aiconsultant.com"
    } catch (err) {
      console.error(err)
      setError("Ошибка соединения с сервером.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад на главную
        </Link>

        <Card className="bg-white shadow-xl border border-gray-200">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Вход в систему</CardTitle>
            <p className="text-gray-500">Введите код, полученный после оплаты</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-800 mt-2">
                Код для входа отправляется на вашу почту после оплаты.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-700">
                  Код доступа
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите код"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Войти
              </Button>
            </form>

            <div className="text-center space-y-4">
              <p className="text-gray-600 text-sm">
                Еще нет доступа?{" "}
                <Link href="/payment" className="text-blue-600 hover:underline">
                  Купить сейчас
                </Link>
              </p>

              <div className="text-gray-400 text-xs">
                <p>После оплаты вы получите:</p>
                <ul className="mt-2 space-y-1 text-left max-w-xs mx-auto">
                  <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Индивидуальный код на email</li>
                  <li className="flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-500" /> Доступ на 30 дней</li>
                  <li className="flex items-center"><Shield className="w-4 h-4 mr-2 text-purple-500" /> Защищённая авторизация</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
