"use client"

import type React from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DemoConsultant from "@/components/DemoConsultant"
import { useCallback } from "react"
import {
  Bot,
  Code,
  FileText,
  Play,
  Gift,
  Zap,
  Shield,
  CheckCircle,
  MessageCircle,
  Mail,
  ChevronDown,
  Monitor,
  Smartphone,
  CreditCard,
  ArrowRight,
  Menu,
  X,
  Send,
  Minimize2,
  Clock,
  Target,
  DollarSign,
  TrendingUp,
  Settings,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function AnimatedLandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Привет! Я ваш ИИ-консультант по интеграции искусственного интеллекта на сайты. Помогу с любыми вопросами о настройке, стоимости и возможностях. О чем хотите узнать?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }
  const scrollToDemo = useCallback(() => {
    const section = document.getElementById("demo")
    if (section) {
      section.scrollIntoView({ behavior: "smooth" })
    }
  }, [])
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "how-it-works", "whats-included", "pricing", "faq", "contact"]
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    setIsTyping(true)

    // Добавляем задержку для реалистичности
    setTimeout(
      async () => {
        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: inputMessage,
              chatHistory: messages.slice(-5), // Отправляем последние 5 сообщений для контекста
            }),
          })

          const data = await response.json()

          // Имитируем постепенное появление текста
          const botResponse = data.response || "Извините, произошла ошибка. Попробуйте еще раз."

          // Создаем сообщение бота
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            timestamp: new Date(),
          }

          setMessages((prev) => [...prev, botMessage])

          // Анимация печатания
          const words = botResponse.split(" ")
          for (let i = 0; i < words.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 100))

            setMessages((prev) => {
              const updated = [...prev]
              const lastMessage = updated[updated.length - 1]
              if (!lastMessage.isUser) {
                lastMessage.text = words.slice(0, i + 1).join(" ")
              }
              return updated
            })
          }
        } catch (error) {
          console.error("Ошибка отправки сообщения:", error)
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Извините, произошла ошибка. Проверьте подключение к интернету.",
            isUser: false,
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, errorMessage])
        } finally {
          setIsTyping(false)
        }
      },
      800 + Math.random() * 1200,
    ) // Случайная задержка 0.8-2 секунды
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Floating Chat Button */}
      {!chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <Button
            onClick={() => setChatOpen(true)}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-16 h-16 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      )}

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white">ИИ Консультант</h3>
                <p className="text-xs text-blue-100">{isOnline ? "Онлайн" : "Оффлайн"}</p>
              </div>
            </div>
            <Button
              onClick={() => setChatOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex flex-col h-80">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      message.isUser
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Напишите сообщение..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full w-10 h-10 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
 {/* Логотип */}
<div className="flex items-center">
  <Link href="/" className="inline-flex items-center" aria-label="FORMAII — КОНСУЛЬТАНТЫ">
    <img
      src="/branding/icononmysitec.svg"
      alt="FORMAII — КОНСУЛЬТАНТЫ"
      className="h-12 w-auto block"  // высота ≈ 40px; впишется в h-16 шапки
    />
  </Link>
</div>


            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: "how-it-works", label: "Как это работает" },
                { id: "benefits", label: "Преимущества" },
                { id: "template", label: "Шаблоны" },
                { id: "pricing", label: "Цены" },
                { id: "contact", label: "Контакты" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors hover:text-blue-600 ${
                    activeSection === item.id ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Кнопка Войти */}
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent ml-4"
                >
                  Войти
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200/50">
              {[
                { id: "how-it-works", label: "Как это работает" },
                { id: "whats-included", label: "Что входит" },
                { id: "pricing", label: "Цены" },
                { id: "contact", label: "Контакты" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}

              {/* Кнопка Войти в мобильном меню */}
              <div className="mt-4 px-4">
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Войти
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                  <Zap className="w-4 h-4 mr-1" />
                  Без кода
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                  <Shield className="w-4 h-4 mr-1" />
                  API готов
                </Badge>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Визуальная настройка
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                ИИ-консультант, который <span className="text-blue-600">увеличивает продажи на 40%</span> за 10 минут
                установки
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Работает 24/7, заменяет живого сотрудника и экономит до 600,000₽ в год. Без программирования.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={scrollToDemo}
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Попробовать демо
                </Button>

                <Button
                  size="lg"
                  className="group bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => (window.location.href = "/payment")}
                >
                  Купить сейчас
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl animate-pulse"></div>
              <img
                src="/images/hero-programmer.png"
                alt="Современный программист за работой"
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-1 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-700">ИИ Ассистент активен</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Как это работает</h2>
            <p className="text-xl text-gray-600">Запусти своего ИИ-консультанта в 3 простых шага</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Оплати - мгновенный доступ",
                description: "Получите все материалы и инструкции сразу после оплаты",
                icon: CreditCard,
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                title: "Вставь код на сайт",
                description: "Скопируйте готовый код и вставьте на ваш сайт за 2 минуты",
                icon: Code,
                color: "from-purple-500 to-purple-600",
              },
              {
                step: "03",
                title: "ИИ-консультант помогает клиентам 24/7",
                description: "Ваш ИИ начинает работать мгновенно и никогда не спит",
                icon: Bot,
                color: "from-green-500 to-green-600",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardContent className="p-0">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-sm font-bold text-gray-400 mb-2">{step.step}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>

                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Преимущества ИИ-консультанта</h2>
            <p className="text-xl text-gray-600">Почему ИИ лучше живого сотрудника</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Работает 24/7",
                desc: "Никаких выходных, отпусков или больничных. Ваши клиенты получают помощь в любое время.",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Не ошибается",
                desc: "Всегда отвечает согласно настройкам. Никакого человеческого фактора или плохого настроения.",
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Стоит в 10 раз дешевле",
                desc: "990₽/месяц против 50,000₽+ зарплаты консультанта. Окупается с первого клиента.",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Повышает доверие",
                desc: "Мгновенные ответы на вопросы увеличивают доверие клиентов и конверсию на 40%.",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Умнеет со временем",
                desc: "Анализирует диалоги и становится лучше. Постоянное обновление базы знаний.",
              },
              {
                icon: <Settings className="w-8 h-8" />,
                title: "Легко настраивается",
                desc: "Настройка за 10 минут без программирования. Готовые шаблоны для любой ниши.",
              },
            ].map((benefit, index) => (
              <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-blue-600">{benefit.icon}</div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

{/* Demo Section */}
<section id="demo" className="py-16 px-4 bg-white">
  <div className="container mx-auto max-w-6xl">
    <div className="text-center mb-16 animate-fade-in-up">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Попробуйте прямо сейчас</h2>
      <p className="text-xl text-gray-600">3 готовых ИИ-консультанта для разных ниш</p>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {[
  {
    name: "Психолог Анна",
    specialty: "Психологическая поддержка",
    avatar: "👩‍⚕️",
    color: "from-pink-500 to-rose-500",
    prompt: "psychology",
  },
  {
    name: "Диетолог Мария",
    specialty: "Питание и здоровье",
    avatar: "🥗",
    color: "from-green-500 to-emerald-500",
    prompt: "diet",
  },
  {
    name: "Бизнес-коуч Игорь",
    specialty: "Развитие бизнеса",
    avatar: "💼",
    color: "from-blue-500 to-indigo-500",
    prompt: "business",
  },
]
.map((consultant, index) => (
        <DemoConsultant
          key={index}
          name={consultant.name}
          specialty={consultant.specialty}
          avatar={consultant.avatar}
          color={consultant.color}
          type={consultant.prompt}
        />
      ))}
    </div>

    <div className="text-center mt-12">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 inline-block">
        <p className="text-amber-800">
          <strong>💡 Это демо-версия.</strong> В полной версии вы сможете настроить собственного консультанта
        </p>
      </div>
    </div>
  </div>
</section>
      {/* Templates Section */}
      <section id="template" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Готовые шаблоны для любой ниши</h2>
            <p className="text-xl text-gray-600">Выберите подходящий или создайте свой</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Психолог", icon: "🧠", desc: "Первичная поддержка, запись на терапию" },
              { name: "Диетолог", icon: "🥗", desc: "Советы по питанию, составление меню" },
              { name: "Бизнес-консультант", icon: "💼", desc: "Анализ бизнеса, стратегии роста" },
              { name: "HR-консультант", icon: "👥", desc: "Подбор персонала, развитие команды" },
              { name: "Финансовый помощник", icon: "💰", desc: "Планирование бюджета, инвестиции" },
              { name: "Репетитор английского", icon: "🇬🇧", desc: "Обучение языку, проверка знаний" },
              { name: "UX-исследователь", icon: "🎨", desc: "Анализ интерфейса, пользовательский опыт" },
              { name: "Фитнес-тренер", icon: "💪", desc: "Программы тренировок, мотивация" },
              { name: "Создать свой", icon: "➕", desc: "Настройте под любую специальность" },
            ].map((template, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-0 text-center">
                  <div className="text-4xl mb-4">{template.icon}</div>
                  <h3 className="font-bold text-lg mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm">{template.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">ИИ vs Живой сотрудник</h2>
            <p className="text-xl text-gray-600">Сравните и убедитесь в выгоде</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white shadow-xl border-0 overflow-hidden">
              <CardContent className="p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Критерий</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">ИИ-консультант</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Живой сотрудник</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Стоимость в год</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">5,390₽</td>
                        <td className="px-6 py-4 text-center text-sm text-red-600 font-semibold">600,000₽+</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Доступность</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600">24/7/365</td>
                        <td className="px-6 py-4 text-center text-sm text-red-600">8 часов в день</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Скорость ответа</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600">Мгновенно</td>
                        <td className="px-6 py-4 text-center text-sm text-red-600">До нескольких минут</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Надёжность</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600">100% стабильно</td>
                        <td className="px-6 py-4 text-center text-sm text-red-600">Зависит от настроения</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">Обучение</td>
                        <td className="px-6 py-4 text-center text-sm text-green-600">Не требуется</td>
                        <td className="px-6 py-4 text-center text-sm text-red-600">Месяцы обучения</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {[
                    {
                      criterion: "Стоимость в год",
                      ai: "5,390₽",
                      human: "600,000₽+",
                      aiColor: "text-green-600",
                      humanColor: "text-red-600",
                    },
                    {
                      criterion: "Доступность",
                      ai: "24/7/365",
                      human: "8 часов в день",
                      aiColor: "text-green-600",
                      humanColor: "text-red-600",
                    },
                    {
                      criterion: "Скорость ответа",
                      ai: "Мгновенно",
                      human: "До нескольких минут",
                      aiColor: "text-green-600",
                      humanColor: "text-red-600",
                    },
                    {
                      criterion: "Надёжность",
                      ai: "100% стабильно",
                      human: "Зависит от настроения",
                      aiColor: "text-green-600",
                      humanColor: "text-red-600",
                    },
                    {
                      criterion: "Обучение",
                      ai: "Не требуется",
                      human: "Месяцы обучения",
                      aiColor: "text-green-600",
                      humanColor: "text-red-600",
                    },
                  ].map((item, index) => (
                    <Card key={index} className="bg-white shadow-sm">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 text-center">{item.criterion}</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-blue-600 font-medium mb-1">ИИ-консультант</div>
                            <div className={`text-sm font-semibold ${item.aiColor}`}>{item.ai}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-600 font-medium mb-1">Живой сотрудник</div>
                            <div className={`text-sm font-semibold ${item.humanColor}`}>{item.human}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <Card className="bg-green-50 border-green-200 inline-block">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Экономия: 594,610₽ в год!</h3>
                  <p className="text-green-700">ИИ-консультант окупается уже в первый месяц</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Простые и честные цены</h2>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="p-6 border-2 border-gray-200">
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold mb-4">Первый месяц</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">990₽</div>
                  <p className="text-gray-600 mb-6">Полный доступ на 30 дней</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Личный ИИ-консультант
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Все шаблоны включены
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Настройка внешнего вида
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Техническая поддержка
                    </li>
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={() => (window.location.href = "/payment")}
                  >
                    Начать сейчас
                  </Button>
                </CardContent>
              </Card>

              <Card className="p-6 border-2 border-blue-500 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white px-4">Продление</Badge>
                </div>
                <CardContent className="p-0">
                  <h3 className="text-xl font-bold mb-4">Следующие месяцы</h3>
                  <div className="text-4xl font-bold text-gray-900 mb-2">400₽</div>
                  <p className="text-gray-600 mb-6">Продление на 30 дней</p>
                  <ul className="text-left space-y-2 mb-6">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Консультант продолжает работать
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Можно изменять настройки
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Новые шаблоны каждый месяц
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      Приоритетная поддержка
                    </li>
                  </ul>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Доступно после первой оплаты</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mt-8 max-w-2xl mx-auto">
              <h4 className="font-bold mb-2">❗ Важно: что происходит, если не продлить подписку</h4>
              <div className="text-left text-sm text-amber-800">
                <p>
                  ✅ <strong>ИИ продолжает работать</strong> — ваши клиенты могут общаться с консультантом
                </p>
                <p>
                  ❌ <strong>Нельзя изменять настройки</strong> — промпт, внешний вид остаются прежними
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Часто задаваемые вопросы</h2>
            <p className="text-xl text-gray-600">Всё что нужно знать</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Нужны ли мне навыки программирования для настройки?",
                answer:
                  "Совсем нет! Наше пошаговое руководство показывает точно, куда вставить код. Если умеешь копировать и вставлять, то сможешь это настроить.",
              },
              {
                question: "Будет ли это работать на моем сайте Tilda/WordPress?",
                answer:
                  "Да! Наш код работает на всех основных платформах, включая Tilda, WordPress, Wix, Squarespace и пользовательские HTML сайты.",
              },
              {
                question: "Нужно ли платить ежемесячно?",
                answer:
                  "Никаких ежемесячных платежей от нас! Ты платишь только один раз за код. Тебе понадобится собственный API ключ OpenAI, который стоит в зависимости от использования (обычно 300-1500₽/месяц).",
              },
              {
                question: "Как быстро я получу материалы?",
                answer:
                  "Мгновенно! После оплаты ты сразу получишь доступ для скачивания всех материалов и сможешь начать настройку своего ИИ-консультанта.",
              },
              {
                question: "Могу ли я настроить внешний вид?",
                answer:
                  "Пакет включает несколько вариантов стилизации и инструкции о том, как подстроить под цвета и дизайн твоего бренда.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="overflow-hidden animate-fade-in-up border-0 bg-gray-50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${openFAQ === index ? "rotate-180" : ""}`} />
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4 animate-fade-in">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="contact" className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Нужна помощь?</h2>
            <p className="text-xl text-gray-600 mb-8">Мы здесь, чтобы поддержать тебя на каждом шаге</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Поддержка в Telegram
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Mail className="w-5 h-5 mr-2" />
                Поддержка по Email
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold">ИИ Консультант</span>
              </div>
              <p className="text-gray-400">&copy; 2025 Все права защищены</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Пользовательское соглашение
              </a>
              <a href="/contacts" className="text-gray-400 hover:text-white transition-colors">
                Контакты и реквизиты
              </a>
              <span className="text-gray-400">Работает на ChatGPT API</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        
        .animate-fade-in-left {
          animation: fade-in-left 0.6s ease-out forwards;
        }
        
        .animate-fade-in-right {
          animation: fade-in-right 0.6s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}