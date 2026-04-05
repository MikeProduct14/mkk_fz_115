# Пошаговая настройка Supabase

## Шаг 1: Создание проекта на Supabase

1. Перейдите на https://supabase.com
2. Нажмите "Start your project" или "Sign in"
3. Войдите через GitHub или email
4. Нажмите "New project"
5. Заполните форму:
   - **Name**: compliance-mfo (или любое другое имя)
   - **Database Password**: придумайте надёжный пароль (сохраните его!)
   - **Region**: выберите ближайший регион (например, Frankfurt для России)
   - **Pricing Plan**: Free (достаточно для разработки)
6. Нажмите "Create new project"
7. Подождите 1-2 минуты, пока проект создаётся

## Шаг 2: Получение API ключей

1. В левом меню выберите **Settings** (⚙️)
2. Выберите **API**
3. Скопируйте два значения:
   - **Project URL** (например: `https://abcdefghijk.supabase.co`)
   - **anon public** ключ (длинная строка, начинается с `eyJ...`)

## Шаг 3: Настройка .env.local

1. Откройте файл `compliance-mfo/.env.local`
2. Замените значения:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## Шаг 4: Выполнение SQL миграции

1. В Supabase Dashboard перейдите в **SQL Editor** (левое меню)
2. Нажмите **New query**
3. Откройте файл `compliance-mfo/supabase/migrations/001_initial_schema.sql`
4. Скопируйте весь SQL код из файла
5. Вставьте в SQL Editor
6. Нажмите **Run** (или Cmd/Ctrl + Enter)
7. Убедитесь, что выполнение прошло успешно (зелёная галочка)

## Шаг 5: Проверка таблиц

1. В левом меню выберите **Table Editor**
2. Вы должны увидеть 4 таблицы:
   - `organizations`
   - `clients`
   - `client_checks`
   - `client_history`

## Шаг 6: Настройка Email Auth (опционально)

1. Перейдите в **Authentication** → **Providers**
2. Убедитесь, что **Email** включён
3. Для разработки можно отключить email подтверждение:
   - **Authentication** → **Settings**
   - Найдите "Enable email confirmations"
   - Отключите (для упрощения тестирования)

## Шаг 7: Запуск проекта

```bash
cd compliance-mfo
npm run dev
```

Откройте http://localhost:3000

## Шаг 8: Тестирование

1. Перейдите на http://localhost:3000
2. Нажмите "Начать работу"
3. Зарегистрируйте тестовый аккаунт
4. Войдите в систему
5. Вы должны попасть на dashboard

## Проверка подключения к БД

Если всё настроено правильно:
- ✅ Регистрация работает
- ✅ Вход работает
- ✅ Dashboard открывается
- ✅ В консоли браузера нет ошибок Supabase

## Возможные проблемы

### Ошибка "Invalid API key"
- Проверьте, что скопировали правильный ключ (anon public, не service_role)
- Убедитесь, что нет лишних пробелов в .env.local

### Ошибка "Failed to fetch"
- Проверьте URL проекта
- Убедитесь, что проект активен в Supabase Dashboard

### Ошибка при выполнении SQL
- Убедитесь, что скопировали весь SQL код
- Проверьте, что нет синтаксических ошибок

## Полезные ссылки

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

## Следующие шаги

После успешной настройки:
1. Протестируйте регистрацию и вход
2. Проверьте, что данные сохраняются в БД
3. Начните разработку форм и функционала
