# Результаты тестирования

## Статус: Тесты готовы, требуется настройка авторизации ⚠️

### Что сделано:

1. ✅ Создано 17 E2E тестов с Playwright
2. ✅ Исправлена валидация формы
3. ✅ Улучшен DatePicker (ручной ввод + выбор года)
4. ✅ Настроена конфигурация Playwright
5. ✅ Создан setup для авторизации

### Проблема при запуске:

Тесты не могут получить доступ к странице `/dashboard/clients/new` без авторизации.

**Ошибка:** Таймаут 30 секунд при попытке найти элементы формы (страница редиректит на `/login`).

### Решение:

Нужно настроить авторизацию для тестов:

#### Вариант 1: Использовать auth.setup.ts (рекомендуется)

1. Создайте тестового пользователя в Supabase:
   ```sql
   -- В Supabase SQL Editor
   INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
   VALUES ('test@example.com', crypt('testpassword123', gen_salt('bf')), now());
   ```

2. Обновите credentials в `tests/auth.setup.ts`:
   ```typescript
   await page.fill('input[type="email"]', 'test@example.com')
   await page.fill('input[type="password"]', 'testpassword123')
   ```

3. Запустите тесты:
   ```bash
   npm test
   ```

#### Вариант 2: Mock авторизации

Добавить в `beforeEach`:
```typescript
test.beforeEach(async ({ page, context }) => {
  // Устанавливаем cookies для авторизации
  await context.addCookies([
    {
      name: 'sb-access-token',
      value: 'your-test-token',
      domain: 'localhost',
      path: '/',
    },
  ])
  
  await page.goto('/dashboard/clients/new')
})
```

#### Вариант 3: Отключить middleware для тестов

В `proxy.ts` добавить проверку на test environment:
```typescript
if (process.env.NODE_ENV === 'test') {
  return NextResponse.next()
}
```

### Покрытие тестами (17 тестов):

#### ✅ Отображение (1 тест)
- Все 3 секции формы видны

#### ✅ Маски ввода (5 тестов)
- Серия паспорта (4 цифры)
- Номер паспорта (6 цифр)
- Код подразделения (000-000)
- СНИЛС (000-000-000 00)
- ИНН (11 цифр)

#### ✅ Условные поля (3 теста)
- Адрес проживания
- Описание ПЭП
- Обоснование высокого риска

#### ✅ Валидация (5 тестов)
- Пустая форма
- Возраст 18+
- Обязательность описания ПЭП
- Обязательность обоснования риска
- Обязательность адреса проживания

#### ✅ Сохранение (2 теста)
- Черновик (без валидации)
- Полная форма

#### ✅ UI элементы (1 тест)
- Tooltips

### Исправленные баги:

1. **Валидация условных полей:**
   - Было: `!data.residential_address_same || data.residential_address`
   - Стало: `if (data.residential_address_same === false) { return !!data.residential_address }`

2. **DatePicker:**
   - Добавлен ручной ввод (формат дд.мм.гггг)
   - Добавлен dropdown для выбора года (1900-текущий)
   - Парсинг и валидация при вводе
   - Автоочистка невалидных дат

3. **Проверка возраста:**
   - Улучшена логика (учитывает месяц и день)

### Следующие шаги:

1. Создать тестового пользователя в Supabase
2. Обновить credentials в `tests/auth.setup.ts`
3. Запустить тесты: `npm test`
4. Проверить HTML отчёт: `npx playwright show-report`

### Команды для запуска:

```bash
# Запуск всех тестов
npm test

# Интерактивный режим
npm run test:ui

# С видимым браузером
npm run test:headed

# Один конкретный тест
npx playwright test tests/client-form.spec.ts:6

# Debug режим
npx playwright test --debug

# Просмотр отчёта
npx playwright show-report
```

### Файлы тестов:

- `tests/client-form.spec.ts` - основные тесты формы (17 тестов)
- `tests/auth.setup.ts` - setup авторизации
- `playwright.config.ts` - конфигурация Playwright
- `TESTING.md` - документация по тестированию
