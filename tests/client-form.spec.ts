import { test, expect } from '@playwright/test'

// ============================================================
// ТЕСТЫ ФОРМЫ НОВОЙ АНКЕТЫ КЛИЕНТА
// ============================================================

// Хелпер для заполнения всех обязательных полей
async function fillRequiredFields(page: any) {
  await page.locator('#last_name').fill('Иванов')
  await page.locator('#first_name').fill('Иван')

  // Дата рождения
  const birthInput = page.locator('#birth_date input, input[placeholder="дд.мм.гггг"]').first()
  await birthInput.fill('15031990')
  await birthInput.blur()
  await page.waitForTimeout(100)

  // Серия и номер паспорта
  await page.locator('#passport_series').fill('1234')
  await page.locator('#passport_number').fill('567890')
  await page.locator('#passport_issued_by').fill('УФМС России по г. Москве')

  // Дата выдачи
  const issueInput = page.locator('#passport_issue_date input, input[placeholder="дд.мм.гггг"]').nth(1)
  await issueInput.fill('01012010')
  await issueInput.blur()
  await page.waitForTimeout(100)

  // Код подразделения
  await page.locator('#passport_department_code').fill('123456')

  // Адрес
  await page.locator('#registration_address').fill('г. Москва, ул. Тестовая, д. 1')
}

test.describe('Форма новой анкеты клиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/clients/new')
    await expect(page.locator('h1')).toBeVisible()
  })

  // --- Отображение ---

  test('отображает все три секции', async ({ page }) => {
    await expect(page.locator('text=Личные данные')).toBeVisible()
    await expect(page.locator('text=Паспортные данные')).toBeVisible()
    await expect(page.locator('text=Оценка риска')).toBeVisible()
  })

  test('отображает кнопки сохранения', async ({ page }) => {
    await expect(page.locator('button:has-text("Сохранить черновик")')).toBeVisible()
    await expect(page.locator('button:has-text("Сохранить и проверить")')).toBeVisible()
  })

  // --- Маски ввода ---

  test('маска серии паспорта — только 4 цифры', async ({ page }) => {
    const input = page.locator('#passport_series')
    await input.fill('12345')
    await expect(input).toHaveValue('1234')
  })

  test('маска номера паспорта — только 6 цифр', async ({ page }) => {
    const input = page.locator('#passport_number')
    await input.fill('1234567')
    await expect(input).toHaveValue('123456')
  })

  test('маска кода подразделения — формат 000-000', async ({ page }) => {
    const input = page.locator('#passport_department_code')
    await input.click()
    await input.pressSequentially('123456', { delay: 100 })
    await page.waitForTimeout(300)
    await expect(input).toHaveValue('123-456', { timeout: 5000 })
  })

  test('маска СНИЛС — формат 000-000-000 00', async ({ page }) => {
    const input = page.locator('#snils')
    await input.fill('12345678901')
    await expect(input).toHaveValue('123-456-789 01')
  })

  // --- DatePicker ---

  test('DatePicker — ручной ввод даты', async ({ page }) => {
    const input = page.locator('input[placeholder="дд.мм.гггг"]').first()
    await input.fill('15031990')
    await expect(input).toHaveValue('15.03.1990')
    await input.blur()
    await page.waitForTimeout(100)
    await expect(input).toHaveValue('15.03.1990')
  })

  test('DatePicker — открывается календарь', async ({ page }) => {
    const calBtn = page.locator('button[type="button"]').filter({ hasText: '📅' }).first()
    await calBtn.click()
    await expect(page.locator('[role="dialog"]')).toBeVisible()
  })

  test('DatePicker — невалидная дата очищается', async ({ page }) => {
    const input = page.locator('input[placeholder="дд.мм.гггг"]').first()
    await input.fill('32.13.2000')
    await input.blur()
    await page.waitForTimeout(100)
    await expect(input).toHaveValue('')
  })

  // --- Условные поля ---

  test('поле адреса проживания скрыто по умолчанию', async ({ page }) => {
    await expect(page.locator('#residential_address')).not.toBeVisible()
  })

  test('поле адреса проживания появляется при снятии чекбокса', async ({ page }) => {
    // Кликаем по label вместо скрытого input
    const label = page.locator('label[for="residential_address_same"]')
    await label.scrollIntoViewIfNeeded()
    await label.click()
    await page.waitForTimeout(300)
    await expect(page.locator('#residential_address')).toBeVisible({ timeout: 5000 })
  })

  test('поле описания ПЭП скрыто по умолчанию', async ({ page }) => {
    await expect(page.locator('#pep_description')).not.toBeVisible()
  })

  test('поле описания ПЭП появляется при включении toggle', async ({ page }) => {
    const label = page.locator('label[for="is_pep"]')
    await label.scrollIntoViewIfNeeded()
    await label.click()
    await page.waitForTimeout(300)
    await expect(page.locator('#pep_description')).toBeVisible({ timeout: 5000 })
  })

  test('поле обоснования риска скрыто по умолчанию', async ({ page }) => {
    await expect(page.locator('#risk_reason')).not.toBeVisible()
  })

  test('поле обоснования риска появляется при выборе "Высокий"', async ({ page }) => {
    const label = page.locator('label[for="risk-high"]')
    await label.scrollIntoViewIfNeeded()
    await label.click()
    await page.waitForTimeout(300)
    await expect(page.locator('#risk_reason')).toBeVisible({ timeout: 5000 })
  })

  // --- Валидация ---

  test('показывает ошибки при пустой форме', async ({ page }) => {
    await page.locator('button:has-text("Сохранить и проверить")').click()
    await expect(page.locator('text=Фамилия обязательна')).toBeVisible()
    await expect(page.locator('text=Имя обязательно')).toBeVisible()
  })

  test('валидация возраста 18+', async ({ page }) => {
    await page.locator('#last_name').fill('Иванов')
    await page.locator('#first_name').fill('Иван')

    const today = new Date()
    const under18 = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate())
    const day = String(under18.getDate()).padStart(2, '0')
    const month = String(under18.getMonth() + 1).padStart(2, '0')
    const year = under18.getFullYear()

    const birthInput = page.locator('input[placeholder="дд.мм.гггг"]').first()
    await birthInput.fill(`${day}${month}${year}`)
    await birthInput.blur()

    await page.locator('#passport_series').fill('1234')
    await page.locator('#passport_number').fill('567890')
    await page.locator('#passport_issued_by').fill('УФМС')
    const issueInput = page.locator('input[placeholder="дд.мм.гггг"]').nth(1)
    await issueInput.fill('01012020')
    await issueInput.blur()
    await page.locator('#passport_department_code').fill('123456')
    await page.locator('#registration_address').fill('Москва')

    await page.locator('button:has-text("Сохранить и проверить")').click()
    await expect(page.locator('text=/18 лет|старше/i')).toBeVisible({ timeout: 3000 })
  })

  test('валидация обязательности описания ПЭП', async ({ page }) => {
    await fillRequiredFields(page)
    const label = page.locator('label[for="is_pep"]')
    await label.scrollIntoViewIfNeeded()
    await label.click()
    // Не заполняем pep_description
    await page.locator('button:has-text("Сохранить и проверить")').click()
    await expect(page.locator('text=/публичн|должност/i')).toBeVisible({ timeout: 3000 })
  })

  test('валидация обязательности обоснования высокого риска', async ({ page }) => {
    await fillRequiredFields(page)
    const label = page.locator('label[for="risk-high"]')
    await label.scrollIntoViewIfNeeded()
    await label.click()
    // Не заполняем risk_reason
    await page.locator('button:has-text("Сохранить и проверить")').click()
    await expect(page.locator('text=/обоснован|высок/i')).toBeVisible({ timeout: 3000 })
  })

  // --- Сохранение ---

  test('сохранение черновика с минимальными данными', async ({ page }) => {
    await page.locator('#last_name').fill('Тестов')
    await page.locator('#first_name').fill('Тест')
    await page.locator('button:has-text("Сохранить черновик")').click()

    // Должен быть редирект на карточку клиента
    await page.waitForURL('**/clients/**', { timeout: 10000 })
    expect(page.url()).toMatch(/\/clients\/[a-f0-9-]+$/)
  })

  test('сохранение с проверкой при заполненных полях', async ({ page }) => {
    await fillRequiredFields(page)
    await page.locator('button:has-text("Сохранить и проверить")').click()

    // Редирект на карточку клиента
    await page.waitForURL('**/clients/**', { timeout: 10000 })
    expect(page.url()).toMatch(/\/clients\/[a-f0-9-]+$/)
  })
})
