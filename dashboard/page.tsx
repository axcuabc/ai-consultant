"use client"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, LogOut, Calendar, Eye, Edit3, Palette, LinkIcon, MessageCircle, Clock, Crown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  subscription_ends_at: string | null
  has_paid: boolean
}

interface Consultant {
  id: string
  user_id: string
  name: string
  prompt: string
  avatar_url: string
  theme_color: string
  target_url: string
  model: string
  temperature: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [consultant, setConsultant] = useState<Consultant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionStatus, setSubscriptionStatus] = useState<"active" | "expired" | "never">("never")
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      // Получаем данные пользователя из таблицы users
      const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      if (userData) {
        setUser(userData)

        // Определяем статус подписки
        if (!userData.has_paid) {
          setSubscriptionStatus("never")
        } else if (userData.subscription_ends_at && new Date(userData.subscription_ends_at) > new Date()) {
          setSubscriptionStatus("active")
        } else {
          setSubscriptionStatus("expired")
        }

        // Получаем данные консультанта
        const { data: consultantData } = await supabase
          .from("consultants")
          .select("*")
          .eq("user_id", authUser.id)
          .single()

        setConsultant(consultantData)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Не определено"
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getDaysUntilExpiry = () => {
    if (!user?.subscription_ends_at) return 0
    const expiry = new Date(user.subscription_ends_at)
    const now = new Date()
    const diffTime = expiry.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const canEdit = subscriptionStatus === "active"

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Личный кабинет</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="text-gray-600 hover:text-gray-900">
                На главную
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Статус подписки</p>
                  <div className="flex items-center space-x-2">
                    {subscriptionStatus === "active" && (
                      <Badge className="bg-green-100 text-green-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Активна
                      </Badge>
                    )}
                    {subscriptionStatus === "expired" && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Истекла
                      </Badge>
                    )}
                    {subscriptionStatus === "never" && (
                      <Badge className="bg-red-100 text-red-800">Не активирована</Badge>
                    )}
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
              {subscriptionStatus === "active" && (
                <p className="text-xs text-gray-500 mt-2">Осталось дней: {getDaysUntilExpiry()}</p>
              )}
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ваш email</p>
                  <p className="font-medium text-gray-900">{user?.email}</p>
                </div>
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Консультант</p>
                  <p className="font-medium text-gray-900">{consultant ? "Настроен" : "Не создан"}</p>
                </div>
                <Bot className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {subscriptionStatus === "never" ? (
          <Card className="p-8 text-center">
            <CardContent className="p-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Добро пожаловать!</h2>
              <p className="text-gray-600 mb-6">
                Чтобы создать своего ИИ-консультанта, необходимо активировать подписку
              </p>
              <Button
                onClick={() => router.push("/checkout")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Активировать за 4000₽
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Consultant Card */}
            <Card className="lg:col-span-2 p-6">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Мой ИИ-консультант</h2>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Предосмотр
                    </Button>
                    {canEdit && (
                      <Button
                        size="sm"
                        onClick={() => router.push("/template/edit")}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Редактировать
                      </Button>
                    )}
                  </div>
                </div>

                {consultant ? (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                        🤖
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{consultant.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{consultant.prompt.substring(0, 150)}...</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="flex items-center">
                            <Palette className="w-4 h-4 mr-1 text-gray-500" />
                            Цвет: {consultant.theme_color}
                          </span>
                          <span className="flex items-center">
                            <LinkIcon className="w-4 h-4 mr-1 text-gray-500" />
                            {consultant.target_url ? "Есть ссылка" : "Нет ссылки"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Ссылка на консультанта:</h4>
                      <div className="flex items-center space-x-2">
                        <input
                          readOnly
                          value={`${window.location.origin}/chat/${consultant.id}`}
                          className="flex-1 p-2 bg-white border rounded text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/chat/${consultant.id}`)
                            alert("Ссылка скопирована!")
                          }}
                        >
                          Копировать
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Консультант не создан</h3>
                    <p className="text-gray-600 mb-4">Выберите шаблон и создайте своего ИИ-помощника</p>
                    {canEdit && (
                      <Button
                        onClick={() => router.push("/template/create")}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        Создать консультанта
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Info */}
            <Card className="p-6">
              <CardContent className="p-0">
                <h3 className="font-bold text-lg mb-4">Подписка</h3>

                {subscriptionStatus === "active" && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-semibold">✅ Активна до:</p>
                      <p className="text-green-700">{formatDate(user?.subscription_ends_at)}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Что доступно:</p>
                      <ul className="text-sm space-y-1">
                        <li>✅ Редактирование промпта</li>
                        <li>✅ Настройка внешнего вида</li>
                        <li>✅ Изменение ссылок</li>
                        <li>✅ Техническая поддержка</li>
                      </ul>
                    </div>

                    {getDaysUntilExpiry() <= 7 && (
                      <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Продлить за 400₽</Button>
                    )}
                  </div>
                )}

                {subscriptionStatus === "expired" && (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800 font-semibold">⚠️ Подписка истекла</p>
                      <p className="text-yellow-700 text-sm">{formatDate(user?.subscription_ends_at)}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Что работает:</p>
                      <ul className="text-sm space-y-1">
                        <li>✅ ИИ отвечает клиентам</li>
                        <li>❌ Нельзя менять настройки</li>
                        <li>❌ Нельзя править промпт</li>
                      </ul>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Продлить за 400₽
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Templates Section */}
        {subscriptionStatus !== "never" && (
          <Card className="mt-6 p-6">
            <CardContent className="p-0">
              <h3 className="font-bold text-lg mb-4">Шаблоны консультантов</h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[
                  { name: "Психолог", icon: "🧠", category: "Здоровье" },
                  { name: "Диетолог", icon: "🥗", category: "Питание" },
                  { name: "Бизнес-консультант", icon: "💼", category: "Бизнес" },
                  { name: "HR-консультант", icon: "👥", category: "Персонал" },
                  { name: "Финансовый помощник", icon: "💰", category: "Финансы" },
                  { name: "Репетитор английского", icon: "🇬🇧", category: "Образование" },
                  { name: "UX-исследователь", icon: "🎨", category: "Дизайн" },
                  { name: "Фитнес-тренер", icon: "💪", category: "Спорт" },
                ].map((template, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{template.icon}</div>
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      <p className="text-xs text-gray-500">{template.category}</p>
                      {canEdit && (
                        <Button size="sm" className="mt-2 w-full bg-transparent" variant="outline">
                          Использовать
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
