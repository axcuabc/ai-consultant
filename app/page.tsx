"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

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

          <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white"></div>
          </div>
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
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">ИИ Консультант</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {[
                { id: "how-it-works", label: "Как это работает" },
                { id: "whats-included", label: "Что входит" },
                { id: "pricing", label: "Цены" },
                { id: "faq", label: "Вопросы" },
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

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Добавь ИИ-консультанта на свой сайт за{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  10 минут
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Программирование не нужно. Мы сделаем всё за тебя. Начни сегодня.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
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
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-float">
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
                title: "Покупка доступа",
                description: "Получи мгновенный доступ ко всем материалам и руководствам по настройке",
                icon: CreditCard,
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                title: "Копируй и вставляй код",
                description: "Просто вставь наш фрагмент кода на свой сайт",
                icon: Code,
                color: "from-purple-500 to-purple-600",
              },
              {
                step: "03",
                title: "ИИ Ассистент работает",
                description: "Твой ИИ-консультант начинает помогать клиентам 24/7",
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

      {/* What's Included Section */}
      <section id="whats-included" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Что входит в комплект</h2>
            <p className="text-xl text-gray-600">Всё необходимое для начала работы</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Code,
                title: "HTML Код",
                description: "Готовый к использованию фрагмент кода для твоего сайта",
                image: "/placeholder-uf0qr.png",
              },
              {
                icon: FileText,
                title: "PDF Руководство",
                description: "Пошаговые инструкции по настройке со скриншотами",
                image: "/pdf-setup-guide.png",
              },
              {
                icon: Bot,
                title: "Библиотека промптов",
                description: "Готовые промпты для разных отраслей",
                image: "/ai-prompt-library-interface.png",
              },
              {
                icon: Play,
                title: "Видео настройки",
                description: "Видео-инструкция всего процесса",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                icon: Gift,
                title: "Бонусные шаблоны",
                description: "Шаблоны сообщений чатбота и варианты стилизации",
                image: "/placeholder.svg?height=200&width=300",
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border-0 bg-white"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <item.icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Preview Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Посмотри как это работает</h2>
            <p className="text-xl text-gray-600">Как твой ИИ-консультант будет выглядеть на десктопе и мобильном</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Monitor className="w-8 h-8 mr-3 text-blue-600" />
                Десктопная версия
              </h3>
              <div className="relative">
                <img
                  src="/images/desktop-chat.png"
                  alt="ИИ чат на десктопе"
                  className="rounded-xl shadow-2xl w-full hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg p-3 shadow-lg animate-bounce">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="animate-fade-in-right">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Smartphone className="w-8 h-8 mr-3 text-purple-600" />
                Мобильная версия
              </h3>
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src="/images/mobile-chat.png"
                    alt="ИИ чат на мобильном"
                    className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Идеально для любого бизнеса</h2>
            <p className="text-xl text-gray-600">Посмотри, как разные специалисты используют ИИ-консультантов</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                avatar: "/images/fitness-coach.png",
                title: "Фитнес-тренер",
                description: "Отвечает на вопросы о тренировках и записывает на консультации",
                badge: "Здоровье и фитнес",
              },
              {
                avatar: "/images/psychologist.png",
                title: "Психолог",
                description: "Предоставляет первичную поддержку и записывает на терапию",
                badge: "Психическое здоровье",
              },
              {
                avatar: "/images/stylist.png",
                title: "Стилист",
                description: "Помогает с вопросами стиля и записывает на встречи",
                badge: "Мода и стиль",
              },
              {
                avatar: "/images/business-consultant.png",
                title: "Бизнес-консультант",
                description: "Квалифицирует лиды и объясняет пакеты услуг",
                badge: "Бизнес",
              },
            ].map((useCase, index) => (
              <Card
                key={index}
                className="p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up border-0 bg-gradient-to-br from-white to-gray-50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-0">
                  <img
                    src={useCase.avatar || "/placeholder.svg"}
                    alt={useCase.title}
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover shadow-lg"
                  />
                  <Badge className="mb-3 bg-blue-100 text-blue-700">{useCase.badge}</Badge>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{useCase.title}</h3>
                  <p className="text-gray-600 text-sm">{useCase.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Простая разовая оплата</h2>
            <Card className="p-8 max-w-md mx-auto hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white">
              <CardContent className="p-0">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">990₽</div>
                  <p className="text-gray-600">Разовая оплата</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    "Полный пакет HTML кода",
                    "Пошаговое PDF руководство",
                    "Видео-инструкция по настройке",
                    "Библиотека промптов включена",
                    "Пожизненный доступ",
                    "Поддержка по email",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg mb-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => (window.location.href = "/payment")}
                >
                  Оплатить и получить мгновенный доступ
                </Button>

                <div className="flex justify-center space-x-4 text-gray-400">
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">PayPal</span>
                  <span className="text-sm">QR код</span>
                </div>
              </CardContent>
            </Card>
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
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Пользовательское соглашение
              </Link>
              <Link href="/contacts" className="text-gray-400 hover:text-white transition-colors">
                Контакты и реквизиты
              </Link>
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
