"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { DemoConsultant as Demo } from "@/lib/demo"

const LIMIT = 5

type Msg = { role: "user" | "assistant"; content: string }

export default function DemoConsultant({ demo }: { demo: Pick<Demo, "id" | "title" | "subtitle" | "avatar" | "color" | "welcome" | "suggestions"> }) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: demo.welcome }])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const sent = messages.filter((m) => m.role === "user").length

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || isTyping || sent >= LIMIT) return
    const next: Msg[] = [...messages, { role: "user", content: question }]
    setMessages(next)
    setInput("")
    setIsTyping(true)
    try {
      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Приветствие не отправляем: модель видит только диалог
        body: JSON.stringify({ type: demo.id, messages: next.slice(1) }),
      })
      const data = await res.json().catch(() => ({}))
      setMessages((prev) => [...prev, { role: "assistant", content: data?.response || "Не получилось ответить. Попробуйте ещё раз." }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Нет связи с сервером. Попробуйте ещё раз." }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Card className="flex h-[26rem] flex-col overflow-hidden rounded-2xl shadow-xl">
      <div className={`bg-gradient-to-r ${demo.color} p-4 text-white`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl" aria-hidden>
            {demo.avatar}
          </div>
          <div>
            <h3 className="font-bold leading-tight">{demo.title}</h3>
            <p className="text-sm opacity-90">{demo.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`w-fit max-w-[85%] whitespace-pre-line rounded-xl px-4 py-2 text-sm ${
              m.role === "user" ? "ml-auto bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isTyping && (
          <div className="flex w-fit gap-1 rounded-xl bg-gray-100 px-4 py-3" aria-label="Печатает">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]" />
          </div>
        )}
        {sent === 0 && !isTyping && (
          <div className="flex flex-wrap gap-2 pt-1">
            {demo.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {sent >= LIMIT ? (
        <div className="border-t bg-blue-50 p-4">
          <p className="mb-2 text-center text-sm text-blue-900">Понравилось? Создайте такого же для себя — бесплатно.</p>
          <Button
            size="sm"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={() => (window.location.href = "/auth?mode=signup")}
          >
            Создать своего консультанта
          </Button>
        </div>
      ) : (
        <form
          className="flex gap-2 border-t p-4"
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Задайте вопрос как клиент…"
            maxLength={500}
            className="min-w-0 flex-1 rounded-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTyping}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isTyping} aria-label="Отправить">
            →
          </Button>
        </form>
      )}
    </Card>
  )
}
