"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

export function embedSnippet(origin: string, id: string) {
  return `<script src="${origin}/widget.js" data-id="${id}" async></script>`
}

export default function EmbedCode({ id }: { id: string }) {
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!origin) setOrigin(window.location.origin)
  }, [origin])

  const code = embedSnippet(origin, id)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* буфер обмена недоступен — пользователь скопирует вручную */
    }
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="relative">
        <pre className="whitespace-pre-wrap break-all rounded-lg bg-gray-900 p-4 pr-14 text-sm text-gray-100">
          <code>{code}</code>
        </pre>
        <Button size="sm" variant="secondary" onClick={copy} className="absolute right-2 top-2" aria-label="Скопировать код">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <details className="text-sm text-gray-600">
        <summary className="cursor-pointer font-medium text-gray-800">Куда вставить код</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>Tilda:</b> добавьте на страницу блок «Другое → T123 (HTML-код)» и вставьте код. Или: Настройки сайта → Ещё →
            HTML-код для вставки внутрь HEAD. Нужен платный тариф Tilda. Виджет появится после публикации.{" "}
            <a href="/tilda" target="_blank" className="text-blue-600 underline">
              Подробная инструкция
            </a>
          </li>
          <li>
            <b>Свой сайт:</b> вставьте код перед закрывающим тегом <code>&lt;/body&gt;</code>.
          </li>
          <li>
            <b>Другие конструкторы:</b> ищите «вставка HTML/JS-кода» или «код в &lt;head&gt;».
          </li>
        </ul>
      </details>
    </div>
  )
}
