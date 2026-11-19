"use client"

import Script from "next/script"
import { GA_ID } from "@/lib/metrika"

// Google Analytics 4. Подключается, только если задан NEXT_PUBLIC_GA_ID (вида G-XXXXXXX).
// Переходы внутри сайта GA4 считает сам («Расширенная статистика» → смена страницы по истории браузера).
export function GoogleAnalytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${GA_ID}');`}
      </Script>
    </>
  )
}
