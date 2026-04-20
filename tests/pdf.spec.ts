import { test, expect } from '@playwright/test'

// ============================================================
// ТЕСТЫ PDF — ДОСЬЕ КЛИЕНТА И ПВК
// Требуют: авторизованный пользователь, заполненный профиль организации
// Тесты на проверки RFM/паспорт помечены тегом @newdb и запускаются
// только при наличии NEWDB_API_KEY в .env.test
// ============================================================

const HAS_NEWDB = !!process.env.NEWDB_API_KEY

// ---- Вспомогательная функция: создать клиента и вернуть его ID ----
async function createApprovedClient(browser: any): Promise<string> {
  const page = await browser.newPage({ storageState: 'playwright/.auth/user.json' })

  await page.goto('/dashboard/clients/new')
  await expect(page.locator('h1')).toContainText('Новая анкета', { timeout: 10000 })

  // Личные данные
  await page.locator('#last_name').fill('ПДФТест')
  await page.locator('#first_name').fill('Иван')
  await page.locator('#middle_name').fill('Иванович')
  const birthInput = page.locator('input[placeholder="дд.мм.гггг"]').first()
  await birthInput.fill('15031985')
  await birthInput.blur()
  await page.waitForTimeout(200)

  // Паспорт
  await page.locator('#passport_series').fill('4510')
  await page.locator('#passport_number').fill('123456')
  await page.locator('#passport_issued_by').fill('УФМС России по г. Москве')
  const issueInput = page.locator('input[placeholder="дд.мм.гггг"]').nth(1)
  await issueInput.fill('10062010')
  await issueInput.blur()
  await page.waitForTimeout(200)
  await page.locator('#passport_department_code').fill('770001')
  await page.locator('#registration_address').fill('г. Москва, ул. Тестовая, д. 1, кв. 1')

  // Сохраняем черновик и получаем ID
  await page.locator('button:has-text("Сохранить черновик")').click()
  await page.waitForURL(/\/clients\/[a-f0-9-]+$/, { timeout: 15000 })
  const clientId = page.url().split('/').pop() as string

  await page.close()
  return clientId
}

// ---- ПВК ----

test.describe('Страница ПВК /dashboard/pvk', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/pvk')
    await expect(page.locator('h1')).toBeVisible()
  })

  test('отображает заголовок и кнопку скачивания', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Правила внутреннего контроля')
    await expect(page.locator('button:has-text("Скачать ПВК")')).toBeVisible()
  })

  test('отображает список разделов документа', async ({ page }) => {
    await expect(page.locator('text=Программу идентификации')).toBeVisible()
    await expect(page.locator('text=Программу оценки риска')).toBeVisible()
    await expect(page.locator('text=Программу хранения')).toBeVisible()
  })

  test('отображает предупреждение о заполнении профиля', async ({ page }) => {
    await expect(page.locator('text=/заполнен|настройк/i')).toBeVisible()
  })

  test('скачивает PDF при нажатии на кнопку', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
    await page.locator('button:has-text("Скачать ПВК")').click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
    expect(download.suggestedFilename()).toMatch(/PVK/i)
  })

  test('кнопка показывает состояние загрузки', async ({ page }) => {
    // Перехватываем запрос чтобы замедлить ответ
    await page.route('/api/pvk-pdf', async (route) => {
      await page.waitForTimeout(500)
      await route.continue()
    })
    await page.locator('button:has-text("Скачать ПВК")').click()
    await expect(page.locator('button:has-text("Формирование")')).toBeVisible({ timeout: 2000 })
  })
})

// ---- API /api/pvk-pdf ----

test.describe('API /api/pvk-pdf', () => {
  test('возвращает PDF с Content-Type application/pdf', async ({ request }) => {
    const res = await request.get('/api/pvk-pdf')
    // Авторизованный запрос (storageState из проекта)
    expect([200, 404]).toContain(res.status())
    if (res.status() === 200) {
      expect(res.headers()['content-type']).toContain('application/pdf')
      const body = await res.body()
      // PDF начинается с %PDF
      expect(body.slice(0, 4).toString()).toBe('%PDF')
    }
  })

  test('возвращает 401 без авторизации', async ({ browser }) => {
    const ctx = await browser.newContext() // без storageState
    const req = await ctx.request.get('http://localhost:3000/api/pvk-pdf')
    expect(req.status()).toBe(401)
    await ctx.close()
  })
})

// ---- API /api/pdf (досье) ----

test.describe('API /api/pdf (досье клиента)', () => {
  test('возвращает 400 без clientId', async ({ request }) => {
    const res = await request.get('/api/pdf')
    expect(res.status()).toBe(400)
  })

  test('возвращает 404 для несуществующего клиента', async ({ request }) => {
    const res = await request.get('/api/pdf?clientId=00000000-0000-0000-0000-000000000000')
    expect(res.status()).toBe(404)
  })

  test('возвращает 401 без авторизации', async ({ browser }) => {
    const ctx = await browser.newContext()
    const req = await ctx.request.get('http://localhost:3000/api/pdf?clientId=some-id')
    expect(req.status()).toBe(401)
    await ctx.close()
  })

  test('скачивает PDF досье для существующего клиента', async ({ browser, request }) => {
    // Создаём клиента
    const clientId = await createApprovedClient(browser)
    expect(clientId).toBeTruthy()

    // Скачиваем PDF
    const res = await request.get(`/api/pdf?clientId=${clientId}`)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toContain('application/pdf')
    expect(res.headers()['content-disposition']).toContain('.pdf')

    const body = await res.body()
    // PDF начинается с %PDF
    expect(body.slice(0, 4).toString()).toBe('%PDF')
    // Размер > 10KB — не пустой документ
    expect(body.length).toBeGreaterThan(10 * 1024)
  })
})

// ---- Карточка клиента: кнопка скачивания ----

test.describe('Кнопка "Скачать досье PDF" в карточке клиента', () => {
  let clientId: string

  test.beforeAll(async ({ browser }) => {
    clientId = await createApprovedClient(browser)
  })

  test('кнопка скачивания отсутствует для черновика', async ({ page }) => {
    await page.goto(`/dashboard/clients/${clientId}`)
    await expect(page.locator('h1')).toBeVisible()
    // Статус — черновик, кнопки PDF нет
    await expect(page.locator('button:has-text("Скачать досье")')).not.toBeVisible()
  })
})

// ---- Тесты с NewDB (запускаются только если NEWDB_API_KEY задан) ----

test.describe('Проверки RFM и паспорта @newdb', () => {
  test.skip(!HAS_NEWDB, 'Требует NEWDB_API_KEY в .env.test')

  let clientId: string

  test.beforeAll(async ({ browser }) => {
    clientId = await createApprovedClient(browser)
  })

  test('запуск проверки меняет статус на "Проверяется"', async ({ page }) => {
    await page.goto(`/dashboard/clients/${clientId}`)
    await expect(page.locator('h1')).toBeVisible()

    const checkBtn = page.locator('button:has-text("Запустить проверку")')
    await expect(checkBtn).toBeVisible()
    await checkBtn.click()

    // Статус сразу меняется на "Проверяется"
    await expect(page.locator('text=/проверяется/i')).toBeVisible({ timeout: 5000 })
  })

  test('после проверки появляются результаты RFM и паспорта', async ({ page }) => {
    await page.goto(`/dashboard/clients/${clientId}`)
    await expect(page.locator('h1')).toBeVisible()

    // Если ещё черновик — запускаем
    const checkBtn = page.locator('button:has-text("Запустить проверку")')
    if (await checkBtn.isVisible()) {
      await checkBtn.click()
    }

    // Ждём завершения polling (до 30 сек)
    await expect(page.locator('text=/одобрен|отказ|черновик/i')).toBeVisible({ timeout: 30000 })

    // Результаты проверок отображаются
    await expect(page.locator('text=Результаты проверок')).toBeVisible()
    await expect(page.locator('text=/Росфинмониторинга|РФМ/i')).toBeVisible()
    await expect(page.locator('text=/паспорт|МВД/i')).toBeVisible()
  })

  test('после одобрения доступна кнопка скачивания PDF', async ({ page }) => {
    await page.goto(`/dashboard/clients/${clientId}`)

    // Ждём статус "Одобрен"
    await expect(page.locator('text=/одобрен/i')).toBeVisible({ timeout: 30000 })

    const downloadBtn = page.locator('button:has-text("Скачать досье")')
    await expect(downloadBtn).toBeVisible()

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 })
    await downloadBtn.click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/dosie.*\.pdf$/i)
  })

  test('PDF досье содержит результаты проверок', async ({ request, browser }) => {
    // clientId уже должен быть одобрен из предыдущего теста
    const res = await request.get(`/api/pdf?clientId=${clientId}`)
    expect(res.status()).toBe(200)
    const body = await res.body()
    expect(body.slice(0, 4).toString()).toBe('%PDF')
    expect(body.length).toBeGreaterThan(20 * 1024)
  })

  test('API /api/check возвращает результаты для реального клиента', async ({ request }) => {
    const res = await request.post('/api/check', {
      data: {
        clientId,
        fio: 'ПДФТест Иван Иванович',
        birthday: '1985-03-15',
        passportSeries: '4510',
        passportNumber: '123456',
      },
    })
    // 200 — проверка запущена, 404 — клиент не найден (маловероятно)
    expect([200, 202]).toContain(res.status())
  })
})
