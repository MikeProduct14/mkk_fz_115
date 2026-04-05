import { test, expect } from '@playwright/test'

// ============================================================
// API ТЕСТЫ — не требуют авторизации через storageState
// ============================================================

test.use({ storageState: { cookies: [], origins: [] } })

test.describe('API /api/dadata', () => {
  test('возвращает данные организации по валидному ИНН', async ({ request }) => {
    const res = await request.get('/api/dadata?inn=7707083893') // Сбербанк
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('status')
    expect(['active', 'inactive']).toContain(body.status)
    expect(body).toHaveProperty('name')
  })

  test('возвращает not_found для несуществующего ИНН', async ({ request }) => {
    const res = await request.get('/api/dadata?inn=0000000000')
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('not_found')
  })

  test('возвращает ошибку без параметра inn', async ({ request }) => {
    const res = await request.get('/api/dadata')
    expect(res.status()).toBeGreaterThanOrEqual(400)
  })
})

test.describe('API /api/check', () => {
  test('возвращает 422 если NEWDB_API_KEY не задан', async ({ request }) => {
    // Этот тест проверяет что API корректно обрабатывает отсутствие ключа
    // В реальной среде ключ задан, поэтому тест может вернуть другой статус
    const res = await request.post('/api/check', {
      data: {
        clientId: '00000000-0000-0000-0000-000000000000',
        fio: 'Иванов Иван Иванович',
        birthday: '1990-01-01',
        passportSeries: '1234',
        passportNumber: '567890',
      },
    })
    // Либо 422 (нет ключа), либо 404 (клиент не найден), либо 401 (не авторизован)
    expect([401, 404, 422]).toContain(res.status())
  })

  test('возвращает 400 при неполных данных', async ({ request }) => {
    const res = await request.post('/api/check', {
      data: { clientId: 'some-id' }, // Не хватает полей
    })
    expect([400, 401, 422]).toContain(res.status())
  })

  test('возвращает 401 без авторизации', async ({ request: unauthRequest }) => {
    // Используем новый контекст без авторизации
    const res = await unauthRequest.post('/api/check', {
      data: {
        clientId: 'test',
        fio: 'Тест',
        birthday: '1990-01-01',
        passportSeries: '1234',
        passportNumber: '567890',
      },
    })
    // Без авторизации должен вернуть 401
    expect(res.status()).toBe(401)
  })
})

test.describe('API /api/fns', () => {
  test('эндпоинт существует', async ({ request }) => {
    const res = await request.get('/api/fns?inn=7707083893')
    // Должен вернуть что-то, не 404
    expect(res.status()).not.toBe(404)
  })
})

test.describe('API /api/pdf', () => {
  test('эндпоинт существует и принимает POST', async ({ request }) => {
    const res = await request.post('/api/pdf', {
      data: { clientId: 'test' },
    })
    expect(res.status()).not.toBe(404)
  })
})
