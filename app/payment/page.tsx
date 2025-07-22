"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Bot,
  CheckCircle,
  CreditCard,
  ArrowLeft,
  Shield,
  Clock,
  Download,
  Mail,
  MessageCircle,
  FileText,
  Play,
  Gift,
} from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const handleYooMoneyPayment = async () => {
    if (!email) {
      alert("Пожалуйста, введите email для получения материалов")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: 990,
          description: "ИИ-Консультант для сайта - Полный пакет материалов",
          email: email,
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
        // Перенаправляем на страницу оплаты ЮMoney
        window.location.href = data.paymentUrl
      } else {
        throw new Error(data.error || "Ошибка создания платежа")
      }
    } catch (error) {
      console.error("Ошибка при создании платежа:", error)
      alert("Произошла ошибка. Попробуйте еще раз или обратитесь в поддержку.")
      setIsProcessing(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <CardContent className="p-0">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Оплата успешно завершена!</h1>
            <p className="text-xl text-gray-600 mb-8">Спасибо за покупку! Ваши материалы готовы к скачиванию.</p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-center mb-3">
                  <Download className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold">Скачать материалы</h3>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Скачать ZIP архив</Button>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200">
                <div className="flex items-center mb-3">
                  <Mail className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold">Email с инструкциями</h3>
                </div>
                <p className="text-sm text-gray-600">Отправлен на вашу почту</p>
              </Card>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-4">Что вы получили:</h3>
              <div className="grid md:grid-cols-2 gap-3 text-left">
                {[
                  "HTML код для интеграции",
                  "PDF руководство по настройке",
                  "Видео-инструкция",
                  "Библиотека промптов",
                  "Шаблоны стилизации",
                  "30 дней поддержки",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Вернуться на главную
              </Button>
              <Button
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Поддержка в Telegram
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Назад</span>
              </Button>
            </Link>

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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Завершение покупки</h1>
          <p className="text-xl text-gray-600">Получите мгновенный доступ ко всем материалам</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold mb-6">Ваш заказ</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-semibold">ИИ-Консультант для сайта</h3>
                    <p className="text-sm text-gray-600">Полный пакет материалов</p>
                  </div>
                  <span className="text-2xl font-bold">990₽</span>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Гарантии</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Мгновенный доступ после оплаты</li>
                  <li>• 30 дней поддержки включено</li>
                  <li>• Возврат средств в течение 7 дней</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold mb-3">Что входит в пакет:</h3>
                {[
                  { icon: FileText, text: "HTML код для интеграции" },
                  { icon: FileText, text: "PDF руководство с картинками" },
                  { icon: Play, text: "Видео-инструкция по настройке" },
                  { icon: Bot, text: "Библиотека готовых промптов" },
                  { icon: Gift, text: "Бонусные шаблоны дизайна" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <item.icon className="w-4 h-4 text-blue-600 mr-3" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold mb-6">Оплата через ЮMoney</h2>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">Ю</span>
                </div>
                <p className="text-gray-600">Безопасная оплата через ЮMoney</p>
                <p className="text-sm text-gray-500 mt-2">Принимаем карты Visa, MasterCard, МИР</p>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email для получения материалов *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">На этот email будут отправлены материалы после оплаты</p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Что произойдет после нажатия "Оплатить":</h3>
                <ol className="text-sm text-gray-700 space-y-1">
                  <li>1. Вы будете перенаправлены на безопасную страницу ЮMoney</li>
                  <li>2. Выберите удобный способ оплаты</li>
                  <li>3. После успешной оплаты вернетесь на наш сайт</li>
                  <li>4. Материалы будут отправлены на ваш email</li>
                </ol>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handleYooMoneyPayment}
                disabled={isProcessing || !email}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Создание платежа...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Оплатить 990₽ через ЮMoney
                  </>
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  Нажимая "Оплатить", вы соглашаетесь с{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                    условиями использования
                  </a>
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-center space-x-4 text-gray-400">
                  <img src="/placeholder.svg?height=24&width=40" alt="Visa" className="h-6" />
                  <img src="/placeholder.svg?height=24&width=40" alt="MasterCard" className="h-6" />
                  <img src="/placeholder.svg?height=24&width=40" alt="МИР" className="h-6" />
                  <span className="text-sm">и другие способы</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm">Безопасная оплата</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <span className="text-sm">Мгновенный доступ</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">Гарантия возврата</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
