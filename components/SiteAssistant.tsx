"use client"

import { useEffect } from "react"
import { PRODUCT_ASSISTANT } from "@/lib/demo"

/** Чат на сайте сервиса — тот же виджет, что получают клиенты. */
export default function SiteAssistant() {
  useEffect(() => {
    let handle: { destroy: () => void } | null = null
    let cancelled = false
    let timer = 0
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
      // Кнопка помощника видна всегда. Прячем её, только пока она прямо накрывает
      // поле ввода демо-чата или главные кнопки (на телефоне) — иначе на них не нажать.
      const host = document.querySelector<HTMLElement>('[data-ai-consultant="site-assistant"]')
      if (!host) return
      host.style.transition = "opacity .2s"
      const refresh = () => {
        const launcher = host.shadowRoot?.querySelector<HTMLElement>('[aria-label="Открыть чат"]')
        const open = host.shadowRoot?.querySelector(".root.open")
        if (!launcher || open) {
          host.style.opacity = ""
          host.style.pointerEvents = ""
          return
        }
        const r = launcher.getBoundingClientRect()
        const covers = Array.from(document.querySelectorAll<HTMLElement>("[data-avoid-assistant]")).some((el) => {
          const e = el.getBoundingClientRect()
          return e.width > 0 && r.left < e.right && r.right > e.left && r.top < e.bottom && r.bottom > e.top
        })
        host.style.opacity = covers ? "0" : ""
        host.style.pointerEvents = covers ? "none" : ""
      }
      onScroll = refresh
      window.addEventListener("scroll", refresh, { passive: true })
      window.addEventListener("resize", refresh)
      timer = window.setInterval(refresh, 1000)
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
      window.clearInterval(timer)
      if (onScroll) {
        window.removeEventListener("scroll", onScroll)
        window.removeEventListener("resize", onScroll)
      }
      handle?.destroy()
    }
  }, [])
  return null
}
