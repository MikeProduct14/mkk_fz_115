# Инструкция по настройке Compliance MFO

## 1. Настройка Supabase

### Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Нажмите "New Project"
3. Выберите организацию и регион (рекомендуется ближайший к вашим пользователям)
4. Задайте имя проекта и пароль базы данных
5. Дождитесь создания проекта (2-3 минуты)

### Получение ключей

1. В боковом меню выберите "Project Settings" → "API"
2. Скопируйте:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` ключ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Выполнение миграции

1. В боковом меню выберите "SQL Editor"
2. Нажмите "New Query"
3. Скопируйте содержимое файла `supabase/migrations/001_initial_schema.sql`
4. Вставьте в редактор и нажмите "Run"
5. Убедитесь, что все таблицы созданы без ошибок

### Проверка таблиц

В боковом меню выберите "Table Editor" и убедитесь, что созданы таблицы:
- organizations
- clients
- client_checks
- client_history

## 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# NewDB API (опционально для MVP)
NEWDB_API_KEY=your-newdb-api-key
```

## 3. Запуск проекта

```bash
# Установка зависимостей (если ещё не установлены)
npm install

# Запуск dev сервера
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 4. Первый запуск

1. Перейдите на главную страницу
2. Нажмите "Начать работу" для регистрации
3. Введите email и пароль
4. После регистрации вы будете перенаправлены в dashboard

## 5. Проверка работы

### Проверка аутентификации
- Зарегистрируйтесь с новым email
- Выйдите из системы
- Войдите снова с теми же данными

### Проверка защиты роутов
- Попробуйте открыть `/dashboard` без авторизации
- Вы должны быть перенаправлены на `/login`

### Проверка базы данных
1. В Supabase перейдите в "Table Editor"
2. Откройте таблицу `organizations`
3. Убедитесь, что записи создаются при регистрации пользователей

## 6. Настройка NewDB API (опционально)

Для работы проверок по перечню РФМ и паспортам МВД:

1. Зарегистрируйтесь на [newdb.net](https://newdb.net)
2. Получите API ключ
3. Добавьте его в `.env.local`:
   ```env
   NEWDB_API_KEY=your-key-here
   ```

## 7. Деплой на Vercel

```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel
```

Не забудьте добавить переменные окружения в Vercel Dashboard:
- Settings → Environment Variables
- Добавьте все переменные из `.env.local`

## Структура проекта

```
compliance-mfo/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Страницы аутентификации
│   ├── (dashboard)/       # Защищённые страницы
│   └── api/               # API routes
├── components/            # React компоненты
│   └── ui/               # shadcn/ui компоненты
├── lib/                   # Утилиты и хелперы
│   ├── supabase/         # Supabase клиенты
│   └── validations/      # Zod схемы
├── supabase/             # Supabase конфигурация
│   └── migrations/       # SQL миграции
└── public/               # Статические файлы
```

## Следующие шаги

После успешной настройки можно приступать к разработке:

1. Форма настроек организации (`/dashboard/settings`)
2. Форма добавления клиента (`/dashboard/clients/new`)
3. Карточка клиента с проверками (`/dashboard/clients/[id]`)
4. Генерация PDF досье
5. Генерация ПВК

## Поддержка

При возникновении проблем проверьте:
- Правильность переменных окружения
- Выполнение SQL миграции в Supabase
- Логи в консоли браузера и терминале
- RLS политики в Supabase (должны быть включены)
