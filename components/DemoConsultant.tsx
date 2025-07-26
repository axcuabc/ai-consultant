"use client"

import React, { useState } from "react"

interface DemoConsultantProps {
  name: string
  specialty: string
  avatar: string
  type: "psychology" | "diet" | "business"
  color: string
}

export default function DemoConsultant({ name, specialty, avatar, type, color }: DemoConsultantProps) {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim()) return
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch("/api/consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message: input.trim() }),
      })
      const data = await res.json()
      setResponse(data.response)
    } catch (e) {
      setResponse("Ошибка при запросе к серверу.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-6 rounded-lg shadow-md bg-gradient-to-br ${color} text-white flex flex-col`}>
      <div className="flex items-center mb-4">
        <div className="text-4xl mr-4">{avatar}</div>
        <div>
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-sm opacity-80">{specialty}</p>
        </div>
      </div>

      <textarea
        className="flex-grow p-2 rounded-md text-black"
        rows={4}
        placeholder="Напишите вопрос..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />

      <button
        onClick={handleSend}
        disabled={loading || !input.trim()}
        className="mt-3 bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 disabled:opacity-50"
      >
        {loading ? "Отправка..." : "Задать вопрос"}
      </button>

      {response && (
        <div className="mt-4 bg-white text-black p-3 rounded shadow-inner whitespace-pre-wrap">
          {response}
        </div>
      )}
    </div>
  )
}
