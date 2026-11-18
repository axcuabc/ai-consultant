"use client"

import { useEffect } from "react"
import { PRODUCT_ASSISTANT } from "@/lib/demo"

/** Чат на сайте сервиса — тот же виджет, что получают клиенты. */
export default function SiteAssistant() {
  useEffect(() => {
    let handle: { destroy: () => void } | null = null
    let cancelled = false
    let observer: IntersectionObserver | null = null
    let onScroll: (() => void) | null = null
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
      // Прячем кнопку помощника, пока на экране демо-чат (чтобы не закрывала поле ввода)
      // и на телефоне на первом экране (чтобы не закрывала главную кнопку)
      const demo = document.getElementById("demo")
      const host = document.querySelector<HTMLElement>('[data-ai-consultant="site-assistant"]')
      if (!host) return
      let demoVisible = false
      const refresh = () => {
        const open = host.shadowRoot?.querySelector(".root.open")
        const firstScreen = window.innerWidth < 640 && window.scrollY < 500
        host.style.display = !open && (demoVisible || firstScreen) ? "none" : ""
      }
      if (demo && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          ([entry]) => {
            demoVisible = entry.isIntersecting
            refresh()
          },
          { threshold: 0.25 },
        )
        observer.observe(demo)
      }
      onScroll = refresh
      window.addEventListener("scroll", refresh, { passive: true })
      refresh()
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
      if (onScroll) window.removeEventListener("scroll", onScroll)
      handle?.destroy()
    }
  }, [])
  return null
}
