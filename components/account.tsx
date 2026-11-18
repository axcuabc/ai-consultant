"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { Bot, LifeBuoy, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export type Profile = { id: string; email: string; subscription_ends_at: string | null }
export type SubscriptionStatus = "active" | "expired" | "never"

export function subscriptionStatus(profile: Profile | null): SubscriptionStatus {
  if (!profile?.subscription_ends_at) return "never"
  return new Date(profile.subscription_ends_at) > new Date() ? "active" : "expired"
}

/** Текущий пользователь и его профиль. Без входа перенаправляет на /auth. */
export function useAccount() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!alive) return
      if (!data.user) {
        router.replace("/auth")
        return
      }
      setUser(data.user)
      const { data: row } = await supabase
        .from("users")
        .select("id, email, subscription_ends_at")
        .eq("id", data.user.id)
        .maybeSingle()
      if (!alive) return
      setProfile(row ?? null)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [router])

  return { user, profile, loading }
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const logout = async () => {
    await supabase.auth.signOut()
    router.replace("/auth")
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Bot className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold text-gray-900">ИИ Консультант</span>
          </button>
          <div className="flex items-center gap-1">
            <a
              href="mailto:ai.consultant.site@gmail.com?subject=%D0%9F%D0%BE%D0%BC%D0%BE%D1%89%D1%8C%20%D1%81%20%D0%98%D0%98%20%D0%9A%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D0%BD%D1%82%D0%BE%D0%BC"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LifeBuoy className="h-4 w-4" />
              <span className="hidden sm:inline">Помощь</span>
            </a>
            <Button variant="ghost" onClick={logout} className="gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Выйти</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

export function Spinner() {
  return (
    <div className="flex justify-center py-24">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
    </div>
  )
}
