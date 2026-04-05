import { NextRequest, NextResponse } from 'next/server'

// Прокси для ФНС ЕГРЮЛ API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const inn = searchParams.get('inn')

  if (!inn) {
    return NextResponse.json({ error: 'ИНН не указан' }, { status: 400 })
  }

  try {
    // Запрос к API ФНС
    const response = await fetch(
      `https://egrul.nalog.ru/search.do?query=${inn}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Ошибка запроса к ФНС')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Ошибка получения данных из ФНС' },
      { status: 500 }
    )
  }
}
