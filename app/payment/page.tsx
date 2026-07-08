"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";

const AMOUNT = 4000;

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState("");

  const handlePay = async () => {
    if (!email) {
      alert("Пожалуйста, введите email для получения токена и инструкции");
      return;
    }
    setIsProcessing(true);
    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: AMOUNT,
          description: "ИИ-Консультант — доступ к платформе на 30 дней",
          email,
        }),
      });

      const data = await response.json();

      if (data?.success && data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        console.error("Ошибка ЮKassa:", data);
        alert("Ошибка при создании платежа: " + (data?.error || "Неизвестно"));
      }
    } catch (err) {
      console.error("Ошибка при создании платежа:", err);
      alert("Не удалось создать платёж, попробуйте снова.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40">
        <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад</span>
            </Button>

            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-gray-900 truncate">
                ИИ Консультант
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 py-10">
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Завершение покупки
          </h1>
          <p className="text-base sm:text-xl text-gray-600">
            Получите мгновенный доступ к платформе и начните за 5–10 минут
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="w-full overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Ваш заказ</h2>

              <div className="flex justify-between items-center pb-4 border-b mb-6">
                <div>
                  <h3 className="font-semibold">ИИ-Консультант для сайта</h3>
                  <p className="text-sm text-gray-600">Доступ на 30 дней</p>
                </div>
                <span className="text-2xl font-bold">{AMOUNT}₽</span>
              </div>

              <div className="rounded-lg p-4 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 ring-1 ring-emerald-100">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-emerald-700 mr-2" />
                  <span className="font-semibold text-emerald-900">Гарантии</span>
                </div>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• Мгновенный доступ после оплаты</li>
                  <li>• 30 дней поддержки включено</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email для отправки токена и инструкции *
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  На этот email придут инструкция и <b>токен доступа</b>
                </p>
              </div>

              <Button
                onClick={handlePay}
                disabled={isProcessing || !email}
                className="mt-6 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Создание платежа...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Оплатить {AMOUNT}₽ через ЮMoney
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Блок с преимуществами */}
          <Card className="w-full overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Как это работает</h2>
              <ol className="space-y-3 text-sm text-gray-700">
                <li>1. Оплачиваете на защищённой странице ЮMoney</li>
                <li>2. Получаете письмо с токеном и инструкцией</li>
                <li>3. Вставляете код на свой сайт и запускаете консультанта</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
