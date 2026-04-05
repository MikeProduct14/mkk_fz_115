import { NextRequest, NextResponse } from 'next/server'

// Генерация PDF досье клиента
export async function POST(request: NextRequest) {
  const body = await request.json()

  try {
    // Генерация PDF будет реализована с использованием @react-pdf/renderer
    // на следующем этапе разработки

    return NextResponse.json({
      message: 'Генерация PDF будет реализована на следующем этапе',
      clientData: body,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка генерации PDF' },
      { status: 500 }
    )
  }
}
