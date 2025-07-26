"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, ArrowLeft, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <span>На главную</span>
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
        <Card className="p-8">
          <CardContent className="p-0">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Пользовательское соглашение</h1>
              <p className="text-gray-600">Условия использования сервиса ИИ-Консультант</p>
            </div>

            <div className="prose prose-gray max-w-none">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Общие положения</h2>
              <p className="mb-4 text-gray-700 leading-relaxed">
                <strong>1.1.</strong> Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения
                между владельцем сайта ИИ-Консультант (далее — «Администратор») и пользователем (далее —
                «Пользователь»), который приобретает доступ к продукту — интеграции ИИ-консультанта для своего сайта.
              </p>
              <p className="mb-6 text-gray-700 leading-relaxed">
                <strong>1.2.</strong> Использование сайта и приобретение услуги означает полное и безоговорочное
                принятие условий настоящего Соглашения.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Предмет соглашения</h2>
              <p className="mb-4 text-gray-700 leading-relaxed">
                <strong>2.1.</strong> Администратор предоставляет Пользователю право использовать продукт —
                ИИ-консультанта для сайта, согласно условиям приобретённого пакета.
              </p>
              <p className="mb-6 text-gray-700 leading-relaxed">
                <strong>2.2.</strong> Пользователь получает доступ к материалам, инструкциям и программному коду,
                необходимым для интеграции ИИ-консультанта на свой сайт.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Права и обязанности сторон</h2>
              <p className="mb-2 text-gray-700 leading-relaxed">
                <strong>3.1. Администратор обязуется:</strong>
              </p>
              <ul className="mb-4 text-gray-700 leading-relaxed list-disc pl-6">
                <li>Предоставить доступ к продукту после оплаты;</li>
                <li>Обеспечить техническую поддержку в течение 30 дней с момента покупки;</li>
                <li>Сохранять конфиденциальность персональных данных Пользователя.</li>
              </ul>
              <p className="mb-2 text-gray-700 leading-relaxed">
                <strong>3.2. Пользователь обязуется:</strong>
              </p>
              <ul className="mb-6 text-gray-700 leading-relaxed list-disc pl-6">
                <li>Использовать продукт только в рамках действующего законодательства;</li>
                <li>Не распространять материалы третьим лицам без согласия Администратора;</li>
                <li>Своевременно оплачивать услуги.</li>
              </ul>

              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Условия оплаты и возврата</h2>
              <p className="mb-4 text-gray-700 leading-relaxed">
                <strong>4.1.</strong> Стоимость продукта указана на сайте и подлежит оплате в полном объёме перед
                предоставлением доступа.
              </p>
              <p className="mb-6 text-gray-700 leading-relaxed">
                <strong>4.2.</strong> Возврат средств возможен только при наличии технических проблем, подтверждённых
                Администратором.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Ограничение ответственности</h2>
              <p className="mb-4 text-gray-700 leading-relaxed">
                <strong>5.1.</strong> Администратор не несёт ответственности за работу сайта Пользователя после
                интеграции продукта.
              </p>
              <p className="mb-6 text-gray-700 leading-relaxed">
                <strong>5.2.</strong> Использование ИИ-консультанта осуществляется на риск Пользователя.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Обработка персональных данных</h2>
              <p className="mb-6 text-gray-700 leading-relaxed">
                <strong>6.1.</strong> Пользователь даёт согласие на обработку своих персональных данных, предоставленных
                при регистрации и оплате, в соответствии с действующим законодательством.
              </p>

              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Заключительные положения</h2>
              <p className="mb-4 text-gray-700 leading-relaxed">
                <strong>7.1.</strong> Все споры, возникающие из настоящего Соглашения, решаются путём переговоров, а при
                невозможности — в соответствии с законодательством Российской Федерации.
              </p>
              <p className="mb-6 text-gray-700 leading-relaxed">
                <strong>7.2.</strong> Администратор вправе вносить изменения в Соглашение. Обновлённая версия
                публикуется на сайте.
              </p>

              <div className="bg-blue-50 rounded-lg p-6 mt-8">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Дата последнего обновления:</strong> {new Date().toLocaleDateString("ru-RU")}
                </p>
                <p className="text-sm text-blue-700">
                  Настоящее соглашение вступает в силу с момента его размещения на сайте и действует до его отмены или
                  изменения Администратором.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
              >
                Вернуться на главную
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
