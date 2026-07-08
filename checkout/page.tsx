"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, CheckCircle, CreditCard, ArrowLeft, Shield, Clock, Mail, Zap, Users, Brain } from "lucide-react"
import { useState } from "react"

export default function CheckoutPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState("")

  const handlePayment = async () => {
    if (!email) {
      alert("Пожалуйста, введите email")
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
          amount: 4000,
          description: "ИИ-Консультант - Первый месяц доступа",
          email: email,
        }),
      })

      const data = await response.json()

      if (data.success && data.paymentUrl) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад</span>
            </Button>

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Получить персональный ИИ-консультант</h1>
          <p className="text-xl text-gray-600">Настройте своего помощника за 5 минут</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Что вы получите */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold mb-6">Что входит в подписку</h2>

              <div className="space-y-4 mb-6">
                {[
                  {
                    icon: Bot,
                    title: "Персональный ИИ-консультант",
                    desc: "Уникальный помощник с собственным ID, настроенный под вашу нишу",
                  },
                  {
                    icon: Brain,
                    title: "Готовые шаблоны промптов",
                    desc: "Для психологов, диетологов, бизнес-консультантов и других специалистов",
                  },
                  {
                    icon: Users,
                    title: "Полная кастомизация",
                    desc: "Настройте имя, внешний вид, стиль общения под ваш бренд",
                  },
                  {
                    icon: Zap,
                    title: "Работа 24/7",
                    desc: "Консультант отвечает клиентам круглосуточно на базе DeepSeek AI",
                  },
                  {
                    icon: Mail,
                    title: "Техническая поддержка",
                    desc: "Помогаем с настройкой и отвечаем на вопросы в течение всего периода",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-semibold text-green-800">Гарантии</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Мгновенный доступ после оплаты</li>
                  <li>• 30 дней полного функционала</li>
                  <li>• Консультант работает даже после истечения подписки</li>
                  <li>• Возврат средств в течение 7 дней</li>
                </ul>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">4000₽</div>
                <p className="text-gray-600">за первый месяц</p>
                <p className="text-sm text-gray-500 mt-1">далее 400₽/месяц при желании продлить</p>
              </div>
            </CardContent>
          </Card>

          {/* Форма оплаты */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold mb-6">Оформление подписки</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Email для получения доступа *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    На этот email будут отправлены данные для входа в личный кабинет
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Что произойдет после оплаты:</h3>
                  <ol className="text-sm text-gray-700 space-y-1">
                    <li>1. ✅ Автоматически создастся ваш аккаунт</li>
                    <li>2. 📧 На email придет логин и сгенерированный пароль</li>
                    <li>3. 🎯 В личном кабинете выберете шаблон консультанта</li>
                    <li>4. ⚙️ Настроите под свою нишу и получите ссылку</li>
                    <li>5. 🚀 Консультант готов работать с клиентами 24/7</li>
                  </ol>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !email}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Создание платежа...
                    </div>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Оплатить 4000₽ и получить доступ
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Нажимая "Оплатить", вы соглашаетесь с{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      условиями использования
                    </a>
                  </p>
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
