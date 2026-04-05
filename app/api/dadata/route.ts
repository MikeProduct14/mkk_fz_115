import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const inn = searchParams.get('inn')

  if (!inn) {
    return NextResponse.json({ error: 'ИНН не указан' }, { status: 400 })
  }

  // Валидация ИНН (10 или 12 цифр)
  if (!/^\d{10}$|^\d{12}$/.test(inn)) {
    return NextResponse.json({ error: 'Некорректный ИНН' }, { status: 400 })
  }

  const apiKey = process.env.DADATA_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'API ключ Dadata не настроен' }, { status: 500 })
  }

  try {
    const response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({ query: inn }),
    })

    if (!response.ok) {
      throw new Error(`Dadata API error: ${response.status}`)
    }

    const data = await response.json()

    // Если организация не найдена
    if (!data.suggestions || data.suggestions.length === 0) {
      return NextResponse.json({
        status: 'not_found',
        name: '',
        address: '',
        manager_name: '',
      })
    }

    const org = data.suggestions[0].data

    // Определяем статус
    let status: 'active' | 'inactive' = 'inactive'
    if (org.state?.status === 'ACTIVE') {
      status = 'active'
    }

    // Формируем ответ
    return NextResponse.json({
      status,
      name: org.name?.short_with_opf || org.name?.full || '',
      address: org.address?.value || '',
      manager_name: org.management?.name || '',
    })
  } catch (error) {
    console.error('Dadata API error:', error)
    return NextResponse.json(
      { error: 'Ошибка при запросе к Dadata' },
      { status: 500 }
    )
  }
}
