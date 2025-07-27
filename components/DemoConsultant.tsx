"use client"

import React, { useState } from "react"

interface DemoConsultantProps {
  name: string
  specialty: string
  avatar: string
  type: "psychology" | "diet" | "business"
  color: string // например "from-pink-500 to-rose-500"
}

export default function DemoConsultant({ name, specialty, avatar, type, color }: DemoConsultantProps) {
  // Сообщения чата
  const [messages, setMessages] = useState([
    { text: `Привет! Я ${name}. ${specialty}. Чем могу помочь?`, isUser: false },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [messageCount, setMessageCount] = useState(0)

  // Функция отправки сообщения
  const sendMessage = async () => {
    if (!input.trim() || messageCount >= 3) return

    const newMessages = [...messages, { text: input, isUser: true }]
    setMessages(newMessages)
    setInput("")
    setIsTyping(true)
    setMessageCount((prev) => prev + 1)

    // Имитация ответа ИИ через таймаут
    setTimeout(() => {
      const responses = {
        psychology: [
          "Понимаю ваши переживания. Расскажите подробнее, что вас беспокоит?",
          "Это действительно важный вопрос. Какие эмоции вы испытываете чаще всего?",
          "Благодарю за доверие. Хотели бы записаться на личную консультацию для более глубокой работы?",
        ],
        diet: [
          "Отличный вопрос о питании! Расскажите о ваших текущих пищевых привычках.",
          "Для составления плана питания мне важно знать ваши цели и образ жизни.",
          "Рекомендую записаться на персональную консультацию для составления индивидуального плана питания.",
        ],
        business: [
          "Интересная бизнес-задача! Расскажите больше о вашей текущей ситуации.",
          "Для анализа нужно понимать ваши ресурсы и цели. Какой у вас бюджет на развитие?",
          "Предлагаю обсудить стратегию развития на индивидуальной консультации.",
        ],
      }

      // Берём ответ по типу консультанта и номеру сообщения
      const responseIndex = Math.min(messageCount, 2)
      const response = responses[type][responseIndex]

      setMessages((prev) => [...prev, { text: response, isUser: false }])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  return (
    <div className="flex flex-col rounded-lg shadow-md overflow-hidden h-96">
      {/* Заголовок с градиентом */}
      <div className={`bg-gradient-to-r ${color} p-4 text-white flex items-center space-x-3`}>
        <div className="text-2xl">{avatar}</div>
        <div>
          <h3 className="font-bold">{name}</h3>
          <p className="text-sm opacity-90">{specialty}</p>
        </div>
      </div>

      {/* Окно сообщений */}
      <div className="flex-1 p-4 overflow-y-auto bg-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`mb-3 flex ${msg.isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block p-2 rounded-lg text-sm max-w-[80%] ${
                msg.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Индикация печати */}
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="inline-block p-2 rounded-lg bg-gray-100">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель ввода */}
      {messageCount >= 3 ? (
        <div className="p-4 bg-amber-50 border-t text-center">
          <p className="text-sm text-amber-800 mb-2">Лимит сообщений достигнут</p>
          <button
            onClick={() => (window.location.href = "/checkout")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded hover:opacity-90 transition"
          >
            Получить полный доступ
          </button>
        </div>
      ) : (
        <div className="p-4 border-t flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Напишите сообщение..."
            className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-4 rounded-full transition"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}
