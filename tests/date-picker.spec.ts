import { test, expect } from '@playwright/test'

test.describe('DatePicker компонент', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard/clients/new')
  })

  test('должен позволять выбрать год через dropdown', async ({ page }) => {
    // Открываем календарь для даты рождения
    const calendarButton = page.locator('#birth_date').locator('button')
    await calendarButton.click()

    // Ждём появления календаря
    await page.waitForSelector('[role="dialog"]', { state: 'visible' })

    // Проверяем наличие dropdown для выбора года
    const yearDropdown = page.locator('select').first()
    await expect(yearDropdown).toBeVisible()

    // Выбираем год 1990
    await yearDropdown.selectOption('1990')

    // Проверяем что год изменился
    await expect(yearDropdown).toHaveValue('1990')

    // Выбираем месяц март (индекс 2)
    const monthDropdown = page.locator('select').nth(1)
    await monthDropdown.selectOption('2')

    // Выбираем день 15
    await page.locator('button[name="day"]').filter({ hasText: '15' }).first().click()

    // Проверяем что дата установилась в input
    const dateInput = page.locator('#birth_date input')
    await expect(dateInput).toHaveValue('15.03.1990')
  })

  test('должен корректно обрабатывать ручной ввод даты без смещения', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим дату вручную
    await dateInput.click()
    await dateInput.fill('15031990')

    // Проверяем что автоматически добавились точки
    await expect(dateInput).toHaveValue('15.03.1990')

    // Убираем фокус
    await dateInput.blur()

    // Ждём немного для обработки
    await page.waitForTimeout(100)

    // Проверяем что дата НЕ сместилась на день назад
    await expect(dateInput).toHaveValue('15.03.1990')

    // Проверяем что дата корректно сохранилась (открываем календарь и проверяем выбранную дату)
    const calendarButton = page.locator('#birth_date').locator('button')
    await calendarButton.click()

    // Проверяем что в календаре выбрано 15 марта 1990
    const selectedDay = page.locator('button[name="day"][aria-selected="true"]')
    await expect(selectedDay).toHaveText('15')
  })

  test('должен корректно обрабатывать ввод даты с точками', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим дату с точками
    await dateInput.click()
    await dateInput.fill('15.03.1990')

    await dateInput.blur()
    await page.waitForTimeout(100)

    // Проверяем что дата сохранилась
    await expect(dateInput).toHaveValue('15.03.1990')
  })

  test('должен очищать невалидную дату при потере фокуса', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим невалидную дату (32 число)
    await dateInput.click()
    await dateInput.fill('32.03.1990')

    await dateInput.blur()
    await page.waitForTimeout(100)

    // Проверяем что поле очистилось
    await expect(dateInput).toHaveValue('')
  })

  test('должен очищать неполную дату при потере фокуса', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим неполную дату
    await dateInput.click()
    await dateInput.fill('15.03')

    await dateInput.blur()
    await page.waitForTimeout(100)

    // Проверяем что поле очистилось
    await expect(dateInput).toHaveValue('')
  })

  test('должен работать с датой выдачи паспорта', async ({ page }) => {
    const dateInput = page.locator('#passport_issue_date input')

    // Вводим дату
    await dateInput.click()
    await dateInput.fill('01012010')

    await expect(dateInput).toHaveValue('01.01.2010')

    await dateInput.blur()
    await page.waitForTimeout(100)

    // Проверяем что дата не сместилась
    await expect(dateInput).toHaveValue('01.01.2010')
  })

  test('должен корректно работать с високосным годом', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим 29 февраля 2000 (високосный год)
    await dateInput.click()
    await dateInput.fill('29.02.2000')

    await dateInput.blur()
    await page.waitForTimeout(100)

    // Проверяем что дата сохранилась
    await expect(dateInput).toHaveValue('29.02.2000')
  })

  test('должен отклонять 29 февраля в невисокосном году', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим 29 февраля 2001 (не високосный год)
    await dateInput.click()
    await dateInput.fill('29.02.2001')

    await dateInput.blur()
    await page.waitForTimeout(100)

    // Проверяем что поле очистилось (невалидная дата)
    await expect(dateInput).toHaveValue('')
  })

  test('должен корректно работать с датами в начале и конце года', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Тест 1: 1 января
    await dateInput.click()
    await dateInput.fill('01.01.1990')
    await dateInput.blur()
    await page.waitForTimeout(100)
    await expect(dateInput).toHaveValue('01.01.1990')

    // Тест 2: 31 декабря
    await dateInput.click()
    await dateInput.clear()
    await dateInput.fill('31.12.1990')
    await dateInput.blur()
    await page.waitForTimeout(100)
    await expect(dateInput).toHaveValue('31.12.1990')
  })

  test('должен ограничивать ввод 10 символами', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Пытаемся ввести больше 10 символов
    await dateInput.click()
    await dateInput.fill('15031990123456')

    // Проверяем что осталось только 10 символов
    await expect(dateInput).toHaveValue('15.03.1990')
  })

  test('должен игнорировать нецифровые символы', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Пытаемся ввести буквы
    await dateInput.click()
    await dateInput.type('abc15def03ghi1990')

    // Проверяем что остались только цифры с точками
    await expect(dateInput).toHaveValue('15.03.1990')
  })

  test('должен синхронизировать input и calendar', async ({ page }) => {
    const dateInput = page.locator('#birth_date input')

    // Вводим дату вручную
    await dateInput.click()
    await dateInput.fill('15.03.1990')
    await dateInput.blur()
    await page.waitForTimeout(100)

    // Открываем календарь
    const calendarButton = page.locator('#birth_date').locator('button')
    await calendarButton.click()

    // Проверяем что в календаре выбрана правильная дата
    const selectedDay = page.locator('button[name="day"][aria-selected="true"]')
    await expect(selectedDay).toHaveText('15')

    // Закрываем календарь
    await page.keyboard.press('Escape')

    // Выбираем другую дату через календарь
    await calendarButton.click()
    await page.locator('button[name="day"]').filter({ hasText: '20' }).first().click()

    // Проверяем что input обновился
    await expect(dateInput).toHaveValue('20.03.1990')
  })
})
