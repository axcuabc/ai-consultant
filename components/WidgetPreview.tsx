"use client"

import { useEffect, useRef } from "react"

type PreviewConfig = {
  id?: string
  name: string
  welcome: string
  color: string
  icon: string
  position: "right" | "left"
  font: string
}

type WidgetHandle = { update: (c: PreviewConfig) => void; destroy: () => void }

declare global {
  interface Window {
    AIConsultantWidget?: {
      mount: (config: PreviewConfig, options: Record<string, unknown>) => WidgetHandle
    }
  }
}

let loader: Promise<void> | null = null
function loadWidgetScript(): Promise<void> {
  if (window.AIConsultantWidget) return Promise.resolve()
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement("script")
      s.src = "/widget.js"
      s.onload = () => resolve()
      s.onerror = () => reject(new Error("widget.js не загрузился"))
      document.head.appendChild(s)
    })
  }
  return loader
}

/** Живой предпросмотр: тот же widget.js, что будет на сайте клиента. */
export default function WidgetPreview({ config }: { config: PreviewConfig }) {
  const box = useRef<HTMLDivElement>(null)
  const handle = useRef<WidgetHandle | null>(null)
  const latest = useRef(config)
  latest.current = config

  useEffect(() => {
    let cancelled = false
    loadWidgetScript().then(() => {
      if (cancelled || !box.current || !window.AIConsultantWidget) return
      handle.current = window.AIConsultantWidget.mount(latest.current, {
        container: box.current,
        inline: true,
        preview: true,
        open: true,
      })
    })
    return () => {
      cancelled = true
      handle.current?.destroy()
      handle.current = null
    }
  }, [])

  useEffect(() => {
    handle.current?.update(config)
  }, [config])

  return (
    <div
      ref={box}
      className="relative h-[640px] w-full overflow-hidden rounded-xl border border-dashed border-gray-300 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%),linear-gradient(45deg,#f8fafc_25%,transparent_25%,transparent_75%,#f8fafc_75%)] bg-[length:24px_24px] bg-[position:0_0,12px_12px]"
      aria-label="Предпросмотр виджета"
    >
      <p className="absolute left-4 top-3 text-xs text-gray-400">Так виджет будет выглядеть на вашем сайте</p>
    </div>
  )
}
