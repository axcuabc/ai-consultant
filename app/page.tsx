"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Play, Zap, Shield, CheckCircle, ChevronDown, CreditCard, ArrowRight, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

export default function AnimatedLandingPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("")

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

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "demo", "how-it-works", "whats-included", "pricing", "faq", "contact"]
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
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
                { id: "demo", label: "Демо" },
                { id: "how-it-works", label: "Как работает" },
                { id: "pricing", label: "Цены" },
                { id: "faq", label: "Вопросы" },
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
                { id: "demo", label: "Демо" },
                { id: "how-it-works", label: "Как работает" },
                { id: "pricing", label: "Цены" },
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
                  Персональный ИИ
                </Badge>
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors">
                  <Shield className="w-4 h-4 mr-1" />
                  30 дней доступа
                </Badge>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Готовые шаблоны
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Персональный{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ИИ-консультант
                </span>{" "}
                для вашей ниши
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Готовые шаблоны для психологов, диетологов, бизнес-консультантов и других специалистов. Настройте один
                раз — работает 24/7.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => (window.location.href = "/checkout")}
                >
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Получить доступ — 990₽
                </Button>
                <Button
                  size="lg"
                  className="group bg-white text-gray-900 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  onClick={() => scrollToSection("demo")}
                >
                  Попробовать демо
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            <div className="relative animate-fade-in-right">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl animate-pulse"></div>
              <img
                src="/placeholder.svg?height=500&width=600&text=AI+Consultant+Dashboard"
                alt="Панель управления ИИ консультантом"
                className="relative z-10 w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
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
                prompt: "психолог",
              },
              {
                name: "Диетолог Мария",
                specialty: "Питание и здоровье",
                avatar: "🥗",
                color: "from-green-500 to-emerald-500",
                prompt: "диетолог",
              },
              {
                name: "Бизнес-коуч Игорь",
                specialty: "Развитие бизнеса",
                avatar: "💼",
                color: "from-blue-500 to-indigo-500",
                prompt: "бизнес-консультант",
              },
            ].map((consultant, index) => (
              <DemoConsultant key={index} consultant={consultant} />
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Как это работает</h2>
            <p className="text-xl text-gray-600">Получите своего ИИ-консультанта в 3 простых шага</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Оплачиваете доступ",
                description: "После оплаты 990₽ получаете логин и пароль на email",
                icon: CreditCard,
                color: "from-blue-500 to-blue-600",
              },
              {
                step: "02",
                title: "Настраиваете консультанта",
                description: "Выбираете шаблон, настраиваете под свою нишу и бренд",
                icon: Bot,
                color: "from-purple-500 to-purple-600",
              },
              {
                step: "03",
                title: "Получаете ссылку",
                description: "Ваш ИИ-консультант готов работать 24/7 с клиентами",
                icon: CheckCircle,
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

      {/* Templates Section */}
      <section className="py-16 px-4 bg-white">
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
                    onClick={() => (window.location.href = "/checkout")}
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
                <p>
                  💡 <strong>Один консультант на пользователя</strong> — фокус на качестве, а не количестве
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
            <p className="text-xl text-gray-600">Всё что нужно знать о подписке</p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "Как создается мой персональный ИИ-консультант?",
                answer:
                  "После оплаты мы создаём для вас уникального ИИ-консультанта с собственным ID. Он привязан к нашему API и работает на модели DeepSeek. Вы получаете ссылку для размещения на сайте или в соцсетях.",
              },
              {
                question: "Что происходит после истечения подписки?",
                answer:
                  "Ваш ИИ-консультант продолжает работать и отвечать клиентам, но вы не сможете изменять промпт, внешний вид или настройки. Для внесения изменений нужно продлить подписку за 400₽.",
              },
              {
                question: "Можно ли создать несколько консультантов?",
                answer:
                  "Нет, на одного пользователя предоставляется один ИИ-консультант. Мы сосредоточены на качестве и персонализации одного помощника под вашу конкретную нишу.",
              },
              {
                question: "Какие есть готовые шаблоны?",
                answer:
                  "У нас есть шаблоны для психологов, диетологов, бизнес-консультантов, HR-специалистов, финансовых консультантов, репетиторов английского, UX-исследователей и фитнес-тренеров. Также можно создать свой уникальный шаблон.",
              },
              {
                question: "Как быстро я получу доступ к консультанту?",
                answer:
                  "Сразу после оплаты на ваш email придет письмо с логином, паролем и инструкциями. Настройка консультанта займет 5-10 минут, после чего он будет готов к работе.",
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
              <a href="/login" className="text-gray-400 hover:text-white transition-colors">
                Вход в кабинет
              </a>
              <span className="text-gray-400">Работает на DeepSeek API</span>
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
      `}</style>
    </div>
  )
}

// Компонент демо-консультанта
function DemoConsultant({ consultant }: { consultant: any }) {
  const [messages, setMessages] = useState([
    { text: `Привет! Я ${consultant.name}. ${consultant.specialty}. Чем могу помочь?`, isUser: false },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)

  const sendMessage = async () => {
    if (!input.trim() || messageCount >= 3) return

    const newMessages = [...messages, { text: input, isUser: true }]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)
    setMessageCount((prev) => prev + 1)

    // Имитируем ответ ИИ
    setTimeout(
      () => {
        const responses = {
          психолог: [
            "Понимаю ваши переживания. Расскажите подробнее, что вас беспокоит?",
            "Это действительно важный вопрос. Какие эмоции вы испытываете чаще всего?",
            "Благодарю за доверие. Хотели бы записаться на личную консультацию для более глубокой работы?",
          ],
          диетолог: [
            "Отличный вопрос о питании! Расскажите о ваших текущих пищевых привычках.",
            "Для составления плана питания мне важно знать ваши цели и образ жизни.",
            "Рекомендую записаться на персональную консультацию для составления индивидуального плана питания.",
          ],
          "бизнес-консультант": [
            "Интересная бизнес-задача! Расскажите больше о вашей текущей ситуации.",
            "Для анализа нужно понимать ваши ресурсы и цели. Какой у вас бюджет на развитие?",
            "Предлагаю обсудить стратегию развития на индивидуальной консультации.",
          ],
        }

        const responseIndex = Math.min(messageCount, 2)
        const response = responses[consultant.prompt as keyof typeof responses][responseIndex]

        setMessages((prev) => [...prev, { text: response, isUser: false }])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  return (
    <Card className="h-96 flex flex-col">
      <div className={`bg-gradient-to-r ${consultant.color} text-white p-4 rounded-t-lg`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{consultant.avatar}</div>
          <div>
            <h3 className="font-bold">{consultant.name}</h3>
            <p className="text-sm opacity-90">{consultant.specialty}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.isUser ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block p-2 rounded-lg text-sm max-w-[80%] ${
                msg.isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-left mb-3">
            <div className="inline-block p-2 rounded-lg bg-gray-100">
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
      </div>

      {messageCount >= 3 ? (
        <div className="p-4 bg-amber-50 border-t">
          <p className="text-sm text-amber-800 text-center mb-2">Лимит сообщений достигнут</p>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => (window.location.href = "/checkout")}
          >
            Получить полный доступ
          </Button>
        </div>
      ) : (
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Напишите сообщение..."
              className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button size="sm" onClick={sendMessage} disabled={!input.trim() || isTyping}>
              →
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Осталось сообщений: {3 - messageCount}</p>
        </div>
      )}
    </Card>
  )
}
