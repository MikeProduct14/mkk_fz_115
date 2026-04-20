import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import { createElement, type ReactElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PvkDocument } from '@/lib/pdf/pvk-template'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { data: org } = await supabase
    .from('organizations')
    .select('name, inn, org_type, address, sdl_name, sdl_position, pvk_updated_at')
    .eq('user_id', user.id)
    .single()

  if (!org) {
    return NextResponse.json(
      { error: 'Заполните профиль организации в настройках' },
      { status: 404 }
    )
  }

  const pdfBuffer = await renderToBuffer(
    createElement(PvkDocument, { organization: org }) as ReactElement<DocumentProps>
  )

  const body = new Uint8Array(pdfBuffer)
  const safeName = org.name.replace(/[^а-яёА-ЯЁa-zA-Z0-9]/g, '_').slice(0, 50)

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="PVK_${safeName}.pdf"`,
      'Content-Length': body.length.toString(),
    },
  })
}
