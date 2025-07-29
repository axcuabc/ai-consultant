"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Zap,
  Palette,
  MessageCircle,
  ArrowRight,
  Play,
  Check,
  Users,
  Shield,
  Smartphone,
  Monitor,
  ChevronDown,
  Mail,
  Send,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const demoConsultants = [
    {
      name: "Психолог Анна",
      specialty: "Психологическая поддержка",
      icon: "👩‍⚕️",
      messages: 3,
    },
    {
      name: "Диетолог Мария",
      specialty: "Питание и здоровье",
      icon: "🥗",
      messages: 3,
    },
    {
      name: "Бизнес-коуч Игорь",
      specialty: "Развитие бизнеса",
      icon: "💼",
      messages: 3,
    },
  ]

  const templates = [
    { icon: "🧠", name: "Психолог", desc: "Первичная поддержка, запись на терапию" },
    { icon: "🥗", name: "Диетолог", desc: "Советы по питанию, составление меню" },
    { icon: "💼", name: "Бизнес-консультант", desc: "Анализ бизнеса, стратегии роста" },
    { icon: "👥", name: "HR-консультант", desc: "Подбор персонала, развитие команды" },
    { icon: "💰", name: "Финансовый помощник", desc: "Планирование бюджета, инвестиции" },
    { icon: "🇬🇧", name: "Репетитор английского", desc: "Обучение языку, проверка знаний" },
    { icon: "🎨", name: "UX-исследователь", desc: "Анализ интерфейса, пользовательский опыт" },
    { icon: "💪", name: "Фитнес-тренер", desc: "Программы тренировок, мотивация" },
    { icon: "➕", name: "Создать свой", desc: "Настройте под любую специальность" },
  ]

  const useCases = [
    {
      title: "Фитнес-тренер",
      category: "Здоровье и фитнес",
      desc: "Отвечает на вопросы о тренировках и записывает на консультации",
    },
    {
      title: "Психолог",
      category: "Психическое здоровье",
      desc: "Предоставляет первичную поддержку и записывает на терапию",
    },
    { title: "Стилист", category: "Мода и стиль", desc: "Помогает с вопросами стиля и записывает на встречи" },
    { title: "Бизнес-консультант", category: "Бизнес", desc: "Квалифицирует лиды и объясняет пакеты услуг" },
  ]

  const faqs = [
    {
      q: "Нужны ли мне навыки программирования для настройки?",
      a: "Нет, программирование не требуется. Мы предоставляем готовый код и подробные инструкции для интеграции.",
    },
    {
      q: "Будет ли это работать на моем сайте Tilda/WordPress?",
      a: "Да, наш ИИ-консультант совместим с любыми платформами через простую интеграцию HTML-кода.",
    },
    {
      q: "Нужно ли платить ежемесячно?",
      a: "Первый месяц стоит 990₽, далее продление по 400₽/месяц. Без продления консультант продолжает работать, но нельзя менять настройки.",
    },
    {
      q: "Как быстро я получу материалы?",
      a: "Материалы отправляются мгновенно на email после успешной оплаты.",
    },
    {
      q: "Могу ли я настроить внешний вид?",
      a: "Да, вы можете полностью настроить дизайн, цвета и стиль консультанта под ваш бренд.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ИИ Консультант
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors">
                Как это работает
              </a>
              <a href="#templates" className="text-white/80 hover:text-white transition-colors">
                Что входит
              </a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">
                Цены
              </a>
              <a href="#faq" className="text-white/80 hover:text-white transition-colors">
                Вопросы
              </a>
              <a href="#contact" className="text-white/80 hover:text-white transition-colors">
                Контакты
              </a>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 bg-transparent"
                >
                  Войти
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-0">
                  <Zap className="w-4 h-4 mr-2" />
                  Без кода API готов
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 ml-2">
                  <Palette className="w-4 h-4 mr-2" />
                  Визуальная настройка
                </Badge>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Добавь{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ИИ-консультанта
                </span>{" "}
                на свой сайт за{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  10 минут
                </span>
              </h1>

              <p className="text-xl text-white/70 leading-relaxed">
                Программирование не нужно. Мы сделаем всё за тебя. Начни сегодня.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Попробовать демо
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Купить сейчас
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
              <img
                src="/ai-hologram-consultant.png"
                alt="Современный ИИ консультант"
                className="relative z-10 w-full max-w-lg mx-auto rounded-2xl"
              />
              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm">ИИ Ассистент активен</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Попробуйте прямо сейчас</h2>
            <p className="text-xl text-white/70">3 готовых ИИ-консультанта для разных ниш</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {demoConsultants.map((consultant, index) => (
              <Card
                key={index}
                className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-cyan-400/50 transition-all cursor-pointer"
                onClick={() => setActiveDemo(index)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{consultant.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{consultant.name}</h3>
                      <p className="text-white/60 text-sm">{consultant.specialty}</p>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <p className="text-white/80 text-sm mb-3">
                      Привет! Я {consultant.name}. {consultant.specialty}. Чем могу помочь?
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Напишите сообщение..."
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button size="icon" className="bg-gradient-to-r from-cyan-500 to-purple-500">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-white/60 text-sm">Осталось сообщений: {consultant.messages}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-white/60">
              💡 Это демо-версия. В полной версии вы сможете настроить собственного консультанта
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Как это работает</h2>
            <p className="text-xl text-white/70">Запусти своего ИИ-консультанта в 3 простых шага</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Покупка доступа",
                desc: "Получи мгновенный доступ ко всем материалам и руководствам по настройке",
                icon: <Shield className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "Копируй и вставляй код",
                desc: "Просто вставь наш фрагмент кода на свой сайт",
                icon: <Brain className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "ИИ Ассистент работает",
                desc: "Твой ИИ-консультант начинает помогать клиентам 24/7",
                icon: <MessageCircle className="w-8 h-8" />,
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 backdrop-blur-sm hover:border-cyan-400/50 transition-all"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
                    {item.step}
                  </div>
                  <div className="text-cyan-400 mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/70">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Готовые шаблоны для любой ниши</h2>
            <p className="text-xl text-white/70">Выберите подходящий или создайте свой</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <Card
                key={index}
                className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-purple-400/50 transition-all cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{template.icon}</div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-white/60 text-sm">{template.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Посмотри как это работает</h2>
            <p className="text-xl text-white/70">Как твой ИИ-консультант будет выглядеть на десктопе и мобильном</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6 text-cyan-400" />
                <h3 className="text-2xl font-semibold text-white">Десктопная версия</h3>
              </div>
              <img
                src="/futuristic-ai-chat.png"
                alt="ИИ чат на десктопе"
                className="w-full rounded-xl border border-white/10"
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-purple-400" />
                <h3 className="text-2xl font-semibold text-white">Мобильная версия</h3>
              </div>
              <div className="flex justify-center">
                <img
                  src="/futuristic-ai-chat.png"
                  alt="ИИ чат на мобильном"
                  className="rounded-xl border border-white/10"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Идеально для любого бизнеса</h2>
            <p className="text-xl text-white/70">Посмотри, как разные специалисты используют ИИ-консультантов</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-black/40 to-black/20 border-white/10 backdrop-blur-sm hover:border-cyan-400/50 transition-all"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-1">{useCase.title}</h3>
                      <p className="text-cyan-400 text-sm mb-3">{useCase.category}</p>
                      <p className="text-white/70">{useCase.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Простые и честные цены</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border-cyan-400/50 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
              <CardContent className="p-8 relative">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Первый месяц</h3>
                  <div className="text-5xl font-bold text-white mb-2">990₽</div>
                  <p className="text-white/70">Полный доступ на 30 дней</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    "Личный ИИ-консультант",
                    "Все шаблоны включены",
                    "Настройка внешнего вида",
                    "Техническая поддержка",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href="/payment">
                  <Button className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0">
                    Начать сейчас
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Продление</h3>
                  <div className="text-5xl font-bold text-white mb-2">400₽</div>
                  <p className="text-white/70">Следующие месяцы</p>
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    "Консультант продолжает работать",
                    "Можно изменять настройки",
                    "Новые шаблоны каждый месяц",
                    "Приоритетная поддержка",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="text-white">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
                  disabled
                >
                  Доступно после первой оплаты
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <Card className="bg-black/40 border-yellow-400/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <h4 className="text-lg font-semibold text-white mb-4">
                  ❗ Важно: что происходит, если не продлить подписку
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-white">
                      ИИ продолжает работать — ваши клиенты могут общаться с консультантом
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 text-lg">❌</span>
                    <span className="text-white">
                      Нельзя изменять настройки — промпт, внешний вид остаются прежними
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-400 text-lg">💡</span>
                    <span className="text-white">
                      Один консультант на пользователя — фокус на качестве, а не количестве
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Часто задаваемые вопросы</h2>
            <p className="text-xl text-white/70">Всё что нужно знать</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-black/40 border-white/10 backdrop-blur-sm">
                <CardContent className="p-0">
                  <button
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  >
                    <span className="text-white font-medium">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-white/60 transition-transform ${openFaq === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-6">
                      <p className="text-white/70">{faq.a}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Нужна помощь?</h2>
            <p className="text-xl text-white/70">Мы здесь, чтобы поддержать тебя на каждом шаге</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-cyan-400/50 transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Поддержка в Telegram</h3>
                <p className="text-white/70 mb-4">Быстрые ответы на ваши вопросы</p>
                <Button
                  variant="outline"
                  className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 bg-transparent"
                >
                  Написать в Telegram
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-white/10 backdrop-blur-sm hover:border-purple-400/50 transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Поддержка по Email</h3>
                <p className="text-white/70 mb-4">Подробные консультации</p>
                <Button
                  variant="outline"
                  className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 bg-transparent"
                >
                  Отправить Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ИИ Консультант
            </div>
            <p className="text-white/60">© 2025 Все права защищены</p>
            <div className="flex justify-center gap-8 text-sm">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Пользовательское соглашение
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                Контакты и реквизиты
              </a>
            </div>
            <p className="text-white/40 text-sm">Работает на ChatGPT API</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
