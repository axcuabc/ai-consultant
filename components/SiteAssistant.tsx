"use client"

import { useEffect } from "react"
import { PRODUCT_ASSISTANT } from "@/lib/demo"

/** Чат на сайте сервиса — тот же виджет, что получают клиенты. */
export default function SiteAssistant() {
  useEffect(() => {
    let handle: { destroy: () => void } | null = null
    let cancelled = false
    let observer: IntersectionObserver | null = null
    const mount = () => {
      const api = (window as unknown as { AIConsultantWidget?: { mount: (c: object, o: object) => { destroy: () => void } } })
        .AIConsultantWidget
      if (!api || cancelled) return
      handle = api.mount(
        {
          id: "site-assistant",
          name: PRODUCT_ASSISTANT.title,
          welcome: PRODUCT_ASSISTANT.welcome,
          color: "#4F46E5",
          icon: "chat",
          position: "right",
          font: "system",
        },
        { demo: "product" },
      )
      // Пока на экране демо-чат, прячем кнопку помощника, чтобы она не закрывала поле ввода
      const demo = document.getElementById("demo")
      const host = document.querySelector<HTMLElement>('[data-ai-consultant="site-assistant"]')
      if (demo && host && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(([entry]) => {
          const open = host.shadowRoot?.querySelector(".root.open")
          host.style.display = entry.isIntersecting && !open ? "none" : ""
        }, { threshold: 0.25 })
        observer.observe(demo)
      }
    }
    if ((window as unknown as { AIConsultantWidget?: unknown }).AIConsultantWidget) mount()
    else {
      const s = document.createElement("script")
      s.src = "/widget.js"
      s.onload = mount
      document.head.appendChild(s)
    }
    return () => {
      cancelled = true
      observer?.disconnect()
      handle?.destroy()
    }
  }, [])
  return null
}
