"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bot, LogOut, Plus, ShoppingBag, Calendar, DollarSign, Mail, User } from "lucide-react"
import { supabase, type Purchase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPurchase, setNewPurchase] = useState({ item_name: "", amount: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    loadPurchases()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth")
      return
    }
    setUser(user)
  }

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase.from("purchases").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setPurchases(data || [])
    } catch (error) {
      console.error("Error loading purchases:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const handleAddPurchase = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newPurchase.item_name || !newPurchase.amount) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: user.id,
            email: user.email,
            item_name: newPurchase.item_name,
            amount: Number.parseFloat(newPurchase.amount),
          },
        ])
        .select()

      if (error) throw error

      // Добавляем новую покупку в список
      if (data && data[0]) {
        setPurchases([data[0], ...purchases])
      }

      // Очищаем форму
      setNewPurchase({ item_name: "", amount: "" })
      setShowAddForm(false)
    } catch (error) {
      console.error("Error adding purchase:", error)
      alert("Ошибка при добавлении покупки")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const totalAmount = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

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
              <span className="font-bold text-xl text-gray-900">ИИ Консультант</span>
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
        {/* Profile Header */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2 p-6">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 mb-1">Общая сумма покупок</p>
                  <p className="text-2xl font-bold text-green-800">{totalAmount.toLocaleString("ru-RU")} ₽</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchases Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Purchase Form */}
          <Card className="p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Добавить покупку</h2>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showAddForm ? "Скрыть" : "Добавить"}
                </Button>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddPurchase} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Название товара</label>
                    <input
                      type="text"
                      value={newPurchase.item_name}
                      onChange={(e) => setNewPurchase({ ...newPurchase, item_name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ИИ-Консультант для сайта"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Сумма (₽)</label>
                    <input
                      type="number"
                      value={newPurchase.amount}
                      onChange={(e) => setNewPurchase({ ...newPurchase, amount: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="4000"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isSubmitting ? "Добавление..." : "Добавить покупку"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Purchases List */}
          <Card className="lg:col-span-2 p-6">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Мои покупки ({purchases.length})
                </h2>
              </div>

              {purchases.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Покупок пока нет</h3>
                  <p className="text-gray-600 mb-4">Добавьте свою первую покупку или совершите покупку на сайте</p>
                  <Button
                    onClick={() => router.push("/payment")}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Купить ИИ-Консультант
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{purchase.item_name}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(purchase.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{purchase.amount.toLocaleString("ru-RU")} ₽</p>
                        <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {purchase.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
