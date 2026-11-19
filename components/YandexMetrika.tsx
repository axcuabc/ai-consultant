"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef } from "react"
import { YM_ID } from "@/lib/metrika"

type Ym = (id: number, method: string, ...args: unknown[]) => void

// При переходах внутри сайта страница не перезагружается, поэтому
// сообщаем Метрике о новом адресе сами.
function PageHits() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    const ym = (window as unknown as { ym?: Ym }).ym
    const query = searchParams?.toString()
    ym?.(YM_ID, "hit", window.location.origin + pathname + (query ? `?${query}` : ""), { referer: document.referrer })
  }, [pathname, searchParams])
  return null
}

export function YandexMetrika() {
  if (!YM_ID) return null
  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,defer:false});`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
        </div>
      </noscript>
      <Suspense fallback={null}>
        <PageHits />
      </Suspense>
    </>
  )
}
