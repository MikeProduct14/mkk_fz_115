'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const NEWDB_KEY = process.env.NEWDB_API_KEY

async function checkRFM(fio: string): Promise<{ result: 'clear' | 'found' | 'error'; details?: any }> {
  try {
    const url = `https://newdb.net/api/terror?fio=${encodeURIComponent(fio)}&key=${NEWDB_KEY}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return { result: 'error' }
    const data = await res.json()
    return data.found ? { result: 'found', details: data.details } : { result: 'clear' }
  } catch {
    return { result: 'error' }
  }
}

async function checkPassport(
  series: string,
  number: string,
  birthday: string
): Promise<{ result: 'clear' | 'found' | 'error'; details?: any }> {
  try {
    const url = `https://newdb.net/api/passport?series=${series}&number=${number}&birthday=${birthday}&key=${NEWDB_KEY}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return { result: 'error' }
    const data = await res.json()
    return data.valid ? { result: 'clear' } : { result: 'found', details: data }
  } catch {
    return { result: 'error' }
  }
}

export async function POST(request: NextRequest) {
  if (!NEWDB_KEY) {
    return NextResponse.json(
      { error: 'NEWDB_API_KEY не настроен. Проверьте конфигурацию сервера.' },
      { status: 422 }
    )
  }

  const supabase = await createClient()

  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const body = await request.json()
  const { clientId, fio, birthday, passportSeries, passportNumber } = body

  if (!clientId || !fio || !birthday || !passportSeries || !passportNumber) {
    return NextResponse.json({ error: 'Не все поля заполнены' }, { status: 400 })
  }

  // Проверяем что клиент принадлежит организации пользователя
  const { data: client } = await supabase
    .from('clients')
    .select('id, org_id')
    .eq('id', clientId)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 })
  }

  // Устанавливаем статус 'checking'
  await supabase.from('clients').update({ status: 'checking' }).eq('id', clientId)

  // Параллельные проверки
  const [rfm, passport] = await Promise.all([
    checkRFM(fio),
    checkPassport(passportSeries, passportNumber, birthday),
  ])

  // Сохраняем результаты проверок
  await supabase.from('client_checks').insert([
    {
      client_id: clientId,
      check_type: 'rfm',
      result: rfm.result,
      details: rfm.details ?? null,
    },
    {
      client_id: clientId,
      check_type: 'passport',
      result: passport.result,
      details: passport.details ?? null,
    },
  ])

  // Определяем итоговый статус
  let newStatus: 'approved' | 'rejected' | 'draft' = 'approved'
  let rejectReason: string | null = null

  if (rfm.result === 'found') {
    newStatus = 'rejected'
    rejectReason = 'Клиент найден в перечне РФМ'
  } else if (passport.result === 'found') {
    newStatus = 'rejected'
    rejectReason = 'Паспорт недействителен'
  } else if (rfm.result === 'error' || passport.result === 'error') {
    newStatus = 'draft'
  }

  // Обновляем статус клиента
  await supabase
    .from('clients')
    .update({ status: newStatus, reject_reason: rejectReason })
    .eq('id', clientId)

  return NextResponse.json({
    status: newStatus,
    checks: [
      { type: 'rfm', result: rfm.result },
      { type: 'passport', result: passport.result },
    ],
  })
}
