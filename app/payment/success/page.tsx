"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

function SuccessContent() {
  const email = useSearchParams().get("email")
  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-5 p-8 text-center">
        <CheckCircle className="mx-auto h-14 w-14 text-green-500" />
        <h1 className="text-2xl font-bold text-gray-900">Спасибо! Платёж обрабатывается</h1>
        <p className="text-gray-600">
          Как только ЮKassa подтвердит оплату (обычно до пары минут), мы откроем доступ и отправим письмо
          {email ? (
            <>
              {" "}на <b>{email}</b>
            </>
          ) : null}
          .
        </p>
        <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 text-left text-sm text-blue-900">
          <Mail className="mt-0.5 h-5 w-5 shrink-0" />
          <span>
            Новым пользователям в письме придёт пароль. Если у вас уже есть аккаунт, входите со своим паролем: подписка
            продлится автоматически. Письма нет? Проверьте папку «Спам».
          </span>
        </div>
        <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
          <Link href="/auth">Войти в кабинет</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <Suspense>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
