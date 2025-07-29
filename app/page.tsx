"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, Send } from "lucide-react"
import DemoConsultant from "@/components/DemoConsultant"

export default function HomePage() {
  const [selectedBot, setSelectedBot] = useState<"psychologist" | "dietitian" | "mentor" | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([{ role: "assistant", content: "Привет! Я твой ИИ-консультант. Какой у тебя вопрос?" }])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!inputValue.trim()) return
    const userMessage = { role: "user", content: inputValue }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          bot: selectedBot,
        }),
      })

      const data = await res.json()

      if (data?.message) {
        setMessages([...updatedMessages, { role: "assistant", content: data.message }])
      } else {
        setMessages([...updatedMessages, { role: "assistant", content: "Извините, произошла ошибка. Попробуйте позже." }])
      }
    } catch (error) {
      setMessages([...updatedMessages, { role: "assistant", content: "Ошибка подключения к серверу." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-300 via-purple-200 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-center mb-2">ИИ Консультант</h1>
          <p className="text-center text-gray-700">
            Выбери специалиста и задай свой вопрос — бесплатно
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <Badge
            variant={selectedBot === "psychologist" ? "default" : "outline"}
            onClick={() => setSelectedBot("psychologist")}
            className="cursor-pointer"
          >
            🧠 Психолог
          </Badge>
          <Badge
            variant={selectedBot === "dietitian" ? "default" : "outline"}
            onClick={() => setSelectedBot("dietitian")}
            className="cursor-pointer"
          >
            🥗 Диетолог
          </Badge>
          <Badge
            variant={selectedBot === "mentor" ? "default" : "outline"}
            onClick={() => setSelectedBot("mentor")}
            className="cursor-pointer"
          >
            🚀 Бизнес-ментор
          </Badge>
        </div>

        {!selectedBot ? (
          <div className="flex flex-col items-center mt-10 space-y-2">
            <Bot className="w-8 h-8 text-purple-600" />
            <p className="text-gray-700 text-center">
              Выберите консультанта, чтобы начать
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {messages.map((m, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      m.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 text-sm max-w-[80%] ${
                        m.role === "user"
                          ? "bg-purple-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <input
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 text-sm"
                  placeholder="Введите сообщение..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit()
                  }}
                />
                <Button onClick={handleSubmit} disabled={loading || !inputValue}>
                  <Send className="w-4 h-4 mr-1" />
                  Отправить
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <DemoConsultant />
        </div>
      </div>
    </div>
  )
}
