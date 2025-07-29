"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface DemoConsultantProps {
  name: string
  specialty: string
  avatar: string
  type: "psychology" | "diet" | "business"
  color: string
}

export default function DemoConsultant({ name, specialty, avatar, type, color }: DemoConsultantProps) {
  const [messages, setMessages] = useState([
    { text: `Привет! Я ${name}. ${specialty}. Чем могу помочь?`, isUser: false },
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

    try {
      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: input.trim() }),
      })
      const data = await res.json()

      setMessages((prev) => [...prev, { text: data.response, isUser: false }])
    } catch (e) {
      setMessages((prev) => [...prev, { text: "Ошибка при обращении к серверу.", isUser: false }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Card className="h-96 flex flex-col animate-fade-in-up shadow-xl rounded-2xl overflow-hidden">
      <div className={`bg-gradient-to-r ${color} text-white p-4`}>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{avatar}</div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm opacity-90">{specialty}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`w-fit max-w-[80%] text-sm px-4 py-2 rounded-xl ${msg.isUser ? "ml-auto bg-blue-500 text-white" : "bg-gray-100 text-gray-800"}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div className="w-fit bg-gray-100 text-gray-800 text-sm px-4 py-2 rounded-xl">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
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
            onClick={() => (window.location.href = "/payment")}
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
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Напишите сообщение..."
              className="flex-1 px-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isTyping}
            />
            <Button size="sm" onClick={sendMessage} disabled={!input.trim() || isTyping}>
              →
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Осталось сообщений: {3 - messageCount}</p>
        </div>
      )}

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
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </Card>
  )
}
