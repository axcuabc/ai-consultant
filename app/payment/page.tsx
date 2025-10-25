"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
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

/**
 * ВАЖНО: замени значения на свои при необходимости
 */
const SIMPLEPAY_ACTION = "https://yookassa.ru/integration/simplepay/payment";
// из конструктора
const SHOP_ID = "1128547";
// сумма к оплате
const AMOUNT = 990;
// страница возврата после успешной оплаты
const SUCCESS_URL = "https://ai-consultant-platform.vercel.app/payment/success";
// страница возврата при ошибке
const FAIL_URL = "https://ai-consultant-platform.vercel.app/payment/fail";

export default function PaymentPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState("");

  // генерируем orderNumber для корреляции (видно и в вебхуке)
  const orderNumber = useMemo(
    () => `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    []
  );

  // refs на скрытые поля конструктора
  const formRef = useRef<HTMLFormElement | null>(null);
  const hiddenEmailRef = useRef<HTMLInputElement | null>(null);
  const hiddenSumRef = useRef<HTMLInputElement | null>(null);
  const hiddenShopRef = useRef<HTMLInputElement | null>(null);
  const hiddenOrderRef = useRef<HTMLInputElement | null>(null);
  const hiddenSuccessRef = useRef<HTMLInputElement | null>(null);
  const hiddenFailRef = useRef<HTMLInputElement | null>(null);

  // синхронизируем e-mail пользователя с hidden полем формы SimplePay
  useEffect(() => {
    if (hiddenEmailRef.current) {
      hiddenEmailRef.current.value = email.trim();
    }
  }, [email]);

  // Фолбэк: если конструктор не загрузился, жмём старую логику /api/create-payment
  const handleYooMoneyPaymentFallback = async () => {
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
          orderNumber,
          successUrl: SUCCESS_URL,
          failUrl: FAIL_URL,
        }),
      });
      const data = await response.json();
      if (data?.success && data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data?.error || "Ошибка создания платежа");
      }
    } catch (err) {
      console.error("Ошибка при создании платежа:", err);
      alert("Произошла ошибка. Попробуйте ещё раз или обратитесь в поддержку.");
      setIsProcessing(false);
    }
  };

  // Основной обработчик: сначала пытаемся сабмитнуть форму SimplePay.
  // Если форма/скрипт не подхватились — используем фолбэк.
  const handlePay = async () => {
    if (!email) {
      alert("Пожалуйста, введите email для получения токена и инструкции");
      return;
    }
    setIsProcessing(true);

    // проставляем значения в скрытых полях (на всякий случай)
    if (hiddenSumRef.current) hiddenSumRef.current.value = String(AMOUNT);
    if (hiddenShopRef.current) hiddenShopRef.current.value = SHOP_ID;
    if (hiddenOrderRef.current) hiddenOrderRef.current.value = orderNumber;
    if (hiddenSuccessRef.current) hiddenSuccessRef.current.value = SUCCESS_URL;
    if (hiddenFailRef.current) hiddenFailRef.current.value = FAIL_URL;
    if (hiddenEmailRef.current) hiddenEmailRef.current.value = email.trim();

    // если форма доступна — сабмитим, иначе фолбэк
    if (formRef.current) {
      try {
        formRef.current.submit();
        return; // дальше не идём, будет редирект на ЮMoney
      } catch (e) {
        console.warn("SimplePay submit failed, fallback to API", e);
      }
    }
    await handleYooMoneyPaymentFallback();
  };

  // Экран успеха (как и раньше; можете дополнить реальными ссылками/файлами)
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Оплата успешно завершена!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Спасибо за покупку! На ваш email отправлены инструкция и <b>токен доступа</b>.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <Card className="p-4 bg-blue-50 border-blue-200 overflow-hidden">
                <div className="flex items-center mb-3">
                  <Download className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold">Материалы</h3>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Скачать ZIP
                </Button>
              </Card>

              <Card className="p-4 bg-purple-50 border-purple-200 overflow-hidden">
                <div className="flex items-center mb-3">
                  <Mail className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold">Письмо отправлено</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Проверьте «Входящие» и «Спам», если письма нет.
                </p>
              </Card>
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Загружаем стили и скрипт конструктора ЮKassa (как в примере) */}
      <link
        rel="stylesheet"
        href="https://yookassa.ru/integration/simplepay/css/yookassa_construct_form.css?v=1.28.0"
      />
      <Script
        src="https://yookassa.ru/integration/simplepay/js/yookassa_construct_form.js?v=1.28.0"
        strategy="afterInteractive"
      />

      {/* Header */}
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
        {/* Заголовок */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Завершение покупки
          </h1>
          <p className="text-base sm:text-xl text-gray-600">
            Получите мгновенный доступ к платформе и начните за 5–10 минут
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Блок заказа */}
          <Card className="w-full overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Ваш заказ</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div className="min-w-0">
                    <h3 className="font-semibold break-words">ИИ-Консультант для сайта</h3>
                    <p className="text-sm text-gray-600 break-words">Доступ на 30 дней</p>
                  </div>
                  <span className="text-2xl font-bold shrink-0">{AMOUNT}₽</span>
                </div>
              </div>

              {/* Гарантии */}
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

              {/* Что входит */}
              <div className="space-y-3">
                <h3 className="font-semibold mb-3">Что входит в пакет:</h3>
                <div className="space-y-2 text-sm text-gray-800">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                    <span>Доступ к платформе на 30 дней</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                    <span>Простая инструкция — справится любой</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                    <span>Шаблоны консультантов под разные ниши</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-blue-600"></span>
                    <span>Возможность менять внешний вид виджета</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Форма оплаты (конструктор ЮKassa) */}
          <Card className="w-full overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Оплата через ЮMoney</h2>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">Ю</span>
                </div>
                <p className="text-gray-600">Безопасная оплата через ЮMoney</p>
                <p className="text-sm text-gray-500 mt-2">
                  Принимаем карты Visa, MasterCard, МИР
                </p>
              </div>

              {/* Поле email */}
              <div className="space-y-4 mb-6">
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
                    На этот email придут инструкция и <b>токен доступа</b> к платформе
                  </p>
                </div>
              </div>

              {/* Нативная форма SimplePay (скрытая) + наша кнопка */}
              <form
                ref={formRef}
                className="yoomoney-payment-form"
                action={SIMPLEPAY_ACTION}
                method="post"
                accept-charset="utf-8"
              >
                {/* Скрытые поля, которые заполняем сами */}
                <input ref={hiddenSumRef} name="sum" type="hidden" defaultValue={String(AMOUNT)} />
                <input ref={hiddenShopRef} name="shopId" type="hidden" defaultValue={SHOP_ID} />

                {/* Доп.поля — сильно помогают в связке с вебхуком и редиректами */}
                <input ref={hiddenOrderRef} name="orderNumber" type="hidden" defaultValue={orderNumber} />
                <input ref={hiddenSuccessRef} name="successURL" type="hidden" defaultValue={SUCCESS_URL} />
                <input ref={hiddenFailRef} name="failURL" type="hidden" defaultValue={FAIL_URL} />

                {/* Email — простое поле, которое конструктор тоже подхватывает */}
                <input ref={hiddenEmailRef} name="customerEmail" type="hidden" defaultValue={email} />
              </form>

              {/* Наша кнопка — сабмит формы или фолбэк */}
              <Button
                onClick={handlePay}
                disabled={isProcessing || !email}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Переход на страницу оплаты...
                  </div>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Оплатить {AMOUNT}₽ через ЮMoney
                  </>
                )}
              </Button>

              <p className="text-center mt-4 text-xs text-gray-500">
                Нажимая «Оплатить», вы соглашаетесь с{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  условиями использования
                </a>
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-wrap items-center justify-center gap-4 text-gray-400">
                  <img src="/placeholder.svg?height=24&width=40" alt="Visa" className="h-6 w-auto" />
                  <img src="/placeholder.svg?height=24&width=40" alt="MasterCard" className="h-6 w-auto" />
                  <img src="/placeholder.svg?height=24&width=40" alt="МИР" className="h-6 w-auto" />
                  <span className="text-sm">и другие способы</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <section className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-gray-700">
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
              <span className="text-sm">Поддержка 30 дней</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
