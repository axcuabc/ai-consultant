import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.formData()
  const label = body.get('label') as string
  const email = body.get('email') as string

  if (!email || !label) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  await supabase.from('purchases').insert([
    {
      email,
      expires_at: expiresAt.toISOString(),
    },
  ])

  const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  })

  // Можно отправить email через Resend (если хочешь)
  console.log(`✅ Оплата прошла. Email: ${email}. Токен: ${token}`)

  return NextResponse.json({ success: true })
}
