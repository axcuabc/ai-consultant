import type { Metadata } from "next"
import Landing from "@/components/Landing"
import { FAQ } from "@/lib/landing"
import { JsonLd } from "@/components/SiteChrome"
import { PLAN } from "@/lib/plans"
import { SITE_NAME, SITE_URL, SUPPORT_EMAIL } from "@/lib/site"

export const metadata: Metadata = { alternates: { canonical: "/" } }

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          url: SITE_URL,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          description:
            "ИИ-помощник в чат сайта для психологов, нутрициологов, дизайнеров и других специалистов: отвечает клиентам 24/7 и приводит к записи.",
          offers: [
            { "@type": "Offer", name: "Создание и проверка", price: 0, priceCurrency: "RUB" },
            { "@type": "Offer", name: "Первый месяц", price: PLAN.startPrice, priceCurrency: "RUB" },
            { "@type": "Offer", name: "Продление на 30 дней", price: PLAN.renewPrice, priceCurrency: "RUB" },
          ],
          provider: { "@type": "Person", name: "Токарева Ангелина Алексеевна", email: SUPPORT_EMAIL },
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <Landing />
    </>
  )
}
