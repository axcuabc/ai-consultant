"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, CheckCircle, Download, MessageCircle, FileText, Play, Gift, Code } from "lucide-react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const [paymentStatus, setPaymentStatus] = useState<"loading" | "success" | "error">("loading")
  const [paymentId, setPaymentId] = useState<string>("")
  const searchParams = useSearchParams()

  useEffect(() => {
    // Получаем параметры из URL после возврата с ЮMoney
    const paymentIdParam = searchParams.get("payment_id")

    if (paymentIdParam) {
      setPaymentId(paymentIdParam)
      // Здесь можно проверить статус платежа через API
      checkPaymentStatus(paymentIdParam)
    } else {
      setPaymentStatus("error")
    }
  }, [searchParams])

  const checkPaymentStatus = async (id: string) => {
    try {
      // Проверяем статус платежа
const response = await fetch("/api/check-payment", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ payment_id: id }),
});

      const data = await response.json()

      if (data.success && data.status === "succeeded") {
        setPaymentStatus("success")
      } else {
        setPaymentStatus("error")
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      setPaymentStatus("error")
    }
  }

  const downloadMaterials = () => {
    // Здесь должна быть логика скачивания материалов
    // Можно создать защищенную ссылку или ZIP архив
    alert("Функция скачивания будет доступна после настройки файлового хранилища")
  }

  if (paymentStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CardContent className="p-0">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Проверяем статус платежа...</h2>
            <p className="text-gray-600">Пожалуйста, подождите</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CardContent className="p-0">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✕</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Ошибка платежа</h2>
            <p className="text-gray-600 mb-6">Платеж не был завершен или произошла ошибка</p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => (window.location.href = "/payment")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Попробовать снова
              </Button>
              <Button variant="outline" onClick={() => (window.location.href = "/")}>
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">ИИ Консультант</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card className="p-8 text-center mb-8">
          <CardContent className="p-0">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Оплата успешно завершена!</h1>
            <p className="text-xl text-gray-600 mb-2">Спасибо за покупку! Ваши материалы готовы.</p>
            {paymentId && <p className="text-sm text-gray-500 mb-8">ID платежа: {paymentId}</p>}

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">📧 Проверьте вашу почту!</h3>
              <p className="text-blue-800 text-sm">
                Мы отправили все материалы на указанный при оплате email адрес. Если письмо не пришло, проверьте папку
                "Спам".
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-0">
              <div className="flex items-center mb-4">
                <Download className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="font-bold text-lg">Скачать материалы</h3>
              </div>
              <p className="text-gray-700 mb-4">Получите прямой доступ ко всем файлам</p>
              <Button onClick={downloadMaterials} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Скачать ZIP архив (2.5 МБ)
              </Button>
            </CardContent>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-0">
              <div className="flex items-center mb-4">
                <MessageCircle className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="font-bold text-lg">Нужна помощь?</h3>
              </div>
              <p className="text-gray-700 mb-4">Поддержка включена в стоимость</p>
              <Button
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 bg-transparent"
              >
                Написать в поддержку
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="p-6">
          <CardContent className="p-0">
            <h3 className="font-bold text-xl mb-6 text-center">Что входит в ваш пакет:</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Code, title: "HTML код", desc: "Готовый виджет для сайта" },
                { icon: FileText, title: "PDF руководство", desc: "Пошаговая инструкция" },
                { icon: Play, title: "Видео-гайд", desc: "Настройка за 10 минут" },
                { icon: Bot, title: "Промпты", desc: "Библиотека для разных ниш" },
                { icon: Gift, title: "Бонусы", desc: "Шаблоны и стили" },
                { icon: MessageCircle, title: "Поддержка", desc: "30 дней помощи" },
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3">
              Вернуться на главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
