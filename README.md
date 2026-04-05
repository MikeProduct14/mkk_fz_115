# Compliance MFO - Система автоматизации compliance по ФЗ-115

Веб-приложение для микрофинансовых организаций (МФО) для автоматизации процессов проверки клиентов по требованиям ФЗ-115 "О противодействии легализации доходов".

## Возможности

- ✅ Управление профилем МФО
- ✅ Создание и редактирование анкет клиентов
- ✅ Автоматические проверки через NewDB API:
  - Проверка по перечню Росфинмониторинга
  - Проверка действительности паспорта МВД
- ✅ Автозаполнение данных организации по ИНН (Dadata API)
- ✅ Оценка риск-профиля клиента
- ✅ История изменений анкет
- ✅ Dashboard с аналитикой

## Технологии

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI**: shadcn/ui компоненты
- **Backend**: Next.js Server Actions, API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Validation**: Zod, react-hook-form
- **Testing**: Playwright
- **API**: Dadata, NewDB

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dadata API (для автозаполнения по ИНН)
DADATA_API_KEY=your_dadata_key

# NewDB API (для проверок РФМ и паспортов)
NEWDB_API_KEY=your_newdb_key
```

### 3. Настройка базы данных

Примените миграцию в Supabase:

```bash
# Файл миграции находится в supabase/migrations/001_initial_schema.sql
# Выполните его в SQL Editor вашего Supabase проекта
```

### 4. Запуск dev сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
compliance-mfo/
├── app/
│   ├── (auth)/              # Страницы авторизации
│   ├── api/                 # API routes
│   └── dashboard/           # Защищённые страницы
│       ├── clients/         # Управление клиентами
│       ├── settings/        # Настройки организации
│       └── pvk/            # ПВК (заглушка)
├── components/
│   ├── ui/                  # shadcn/ui компоненты
│   ├── date-picker.tsx
│   ├── masked-input.tsx
│   └── dashboard-nav.tsx
├── lib/
│   ├── supabase/           # Supabase клиенты
│   └── validations/        # Zod схемы
├── tests/                  # Playwright тесты
└── supabase/
    └── migrations/         # SQL миграции
```

## Тестирование

### Запуск тестов

```bash
# Все тесты
npm test

# С UI
npm run test:ui

# Конкретный файл
npx playwright test auth.spec.ts
```

### Тестовые данные

В файле `TEST_CLIENTS_LINKS.md` находятся 10 тестовых клиентов с паспортными данными для проверки системы.

## Документация

- `QUICK_START.md` - Быстрый старт
- `SUPABASE_SETUP_GUIDE.md` - Настройка Supabase
- `PROJECT_SUMMARY.md` - Полный отчёт о проекте
- `TEST_CLIENTS.md` - Тестовые данные клиентов
- `TESTING.md` - Руководство по тестированию

## Безопасность

- Все роуты dashboard защищены middleware
- RLS (Row Level Security) политики в Supabase
- Валидация данных на клиенте и сервере
- Секретные ключи в .env (не коммитятся)

## Лицензия

MIT

## Автор

Проект создан для автоматизации compliance процессов в МФО
