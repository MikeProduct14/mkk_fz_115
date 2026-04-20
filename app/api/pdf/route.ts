import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { DossierDocument } from '@/lib/pdf/dossier-template'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'clientId обязателен' }, { status: 400 })
  }

  const supabase = await createClient()

  // Проверяем авторизацию
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  // Загружаем организацию пользователя
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, inn, org_type, sdl_name, sdl_position')
    .eq('user_id', user.id)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Организация не найдена' }, { status: 404 })
  }

  // Загружаем клиента с проверкой принадлежности организации
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('org_id', org.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Клиент не найден' }, { status: 404 })
  }

  // Загружаем последние проверки (по одной каждого типа)
  const { data: checks } = await supabase
    .from('client_checks')
    .select('*')
    .eq('client_id', clientId)
    .order('checked_at', { ascending: false })

  const allChecks = checks ?? []

  // Генерируем PDF
  const fio = [client.last_name, client.first_name, client.middle_name]
    .filter(Boolean)
    .join('_')
    .replace(/\s+/g, '_')

  const pdfBuffer = await renderToBuffer(
    createElement(DossierDocument, {
      client,
      checks: allChecks,
      organization: org,
    }) as ReactElement<DocumentProps>
  )

  const body = new Uint8Array(pdfBuffer)

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="dosie_${fio}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
    },
  })
}
