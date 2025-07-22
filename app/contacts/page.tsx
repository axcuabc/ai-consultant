"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, ArrowLeft, Phone, MapPin, Mail, User, FileText, MessageCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ContactsPage() {
  const router = useRouter()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Скопировано в буфер обмена!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>На главну��</span>
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
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Контакты и реквизиты</h1>
          <p className="text-xl text-gray-600">Свяжитесь с нами любым удобным способом</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Контактная информация */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Контактная информация</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Телефон</p>
                    <button
                      onClick={() => copyToClipboard("89162731769")}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      8 (916) 273-17-69
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <button
                      onClick={() => copyToClipboard("ai.consultant.site@gmail.com")}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      ai.consultant.site@gmail.com
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Адрес</p>
                    <p className="text-gray-600">
                      Московская область, г. Химки
                      <br />
                      ул. Московская, дом 21
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Реквизиты */}
          <Card className="p-6">
            <CardContent className="p-0">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Реквизиты</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Индивидуальный предприниматель</p>
                    <p className="text-gray-600">ТОКАРЕВА АНГЕЛИНА АЛЕКСЕЕВНА</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">ИНН</p>
                    <button
                      onClick={() => copyToClipboard("753613922473")}
                      className="text-purple-600 hover:text-purple-700 transition-colors font-mono"
                    >
                      753613922473
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 mt-6">
                <p className="text-sm text-purple-800">
                  <strong>Примечание:</strong> Все платежи обрабатываются через безопасную платежную систему ЮMoney.
                  Чеки и документы об оплате отправляются автоматически на указанный email.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Время работы и поддержка */}
        <Card className="p-6 mb-8">
          <CardContent className="p-0">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Поддержка и время работы</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Техническая поддержка</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Email поддержка: круглосуточно</li>
                  <li>• Ответ в течение 24 часов</li>
                  <li>• Поддержка включена на 30 дней</li>
                  <li>• Помощь с настройкой и интеграцией</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Время работы</h3>
                <ul className="text-gray-600 space-y-2">
                  <li>• Понедельник - Пятница: 9:00 - 18:00 (МСК)</li>
                  <li>• Суббота: 10:00 - 16:00 (МСК)</li>
                  <li>• Воскресенье: выходной</li>
                  <li>• Праздничные дни: по графику РФ</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Быстрые действия */}
        <div className="grid md:grid-cols-3 gap-4">
          <Button
            onClick={() => window.open("tel:89162731769")}
            className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Phone className="w-6 h-6" />
            <span>Позвонить</span>
          </Button>

          <Button
            onClick={() => window.open("mailto:ai.consultant.site@gmail.com")}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Mail className="w-6 h-6" />
            <span>Написать email</span>
          </Button>

          <Button
            onClick={() => router.push("/payment")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 h-auto flex flex-col items-center space-y-2"
          >
            <Bot className="w-6 h-6" />
            <span>Купить сейчас</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
