# Compliance MFO — Claude Code Context

## Что строим
SaaS для малых МФО (микрокредитных компаний) — автоматизация compliance по ФЗ-115.
Целевой пользователь: директор МКК + СДЛ (специальное должностное лицо по ПОД/ФТ).

**Главная ценность:** «Если завтра придёт проверка ЦБ — всё готово.»

Штрафы за нарушения: от 200 000 до 1 000 000 рублей — это главная боль клиента.

---

## Технический стек

- **Next.js 16.2.2**, App Router, TypeScript — строго, без исключений
- **Supabase** — PostgreSQL + auth + storage. Row Level Security обязателен везде.
- **shadcn/ui + Tailwind CSS** — все UI компоненты только отсюда
- **react-hook-form + Zod** — валидация всех форм
- **@react-pdf/renderer** — генерация PDF досье и ПВК

## Критические ограничения — нарушать нельзя

### Внешние API — только через Route Handlers
Все запросы к внешним сервисам (ФНС, NewDB, МВД) делаются ИСКЛЮЧИТЕЛЬНО
через Next.js Route Handlers в `/app/api/`. Никогда не с клиента.
Причина: CORS блокировка на стороне этих сервисов.

### PDF — только @react-pdf/renderer
НЕ использовать puppeteer, html-to-pdf, playwright для PDF.
Они несовместимы с Vercel serverless functions.

### Supabase RLS — изоляция данных МФО
Каждая запись в таблицах clients, client_checks, client_history
должна фильтроваться по org_id. Политики RLS обязательны.

### Секреты — только серверные переменные
NEWDB_API_KEY и другие API-ключи — без префикса NEXT_PUBLIC_.
Только серверная сторона имеет к ним доступ.

---

## Структура проекта

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx              — sidebar + auth guard
│   ├── page.tsx                — главный дашборд со статусом compliance
│   ├── clients/
│   │   ├── page.tsx            — список клиентов
│   │   ├── new/page.tsx        — форма новой анкеты
│   │   └── [id]/page.tsx       — карточка клиента
│   ├── pvk/page.tsx            — скачивание ПВК
│   └── settings/page.tsx       — профиль МФО
└── api/
    ├── fns/route.ts            — прокси ФНС ЕГРЮЛ (серверный)
    ├── check/route.ts          — проверки РФМ + паспорт МВД
    └── pdf/route.ts            — генерация PDF досье

lib/
├── supabase/
│   ├── client.ts               — createBrowserClient
│   └── server.ts               — createServerClient с cookies
└── validations/
    └── client.ts               — Zod схема анкеты клиента

supabase/
└── migrations/
    └── 001_initial_schema.sql
```

---

## Схема БД

### organizations
```
id, user_id (→ auth.users), inn, name, org_type (МКК/МФК),
address, sdl_name, sdl_position, pvk_updated_at, created_at
```

### clients
```
id, org_id (→ organizations), last_name, first_name, middle_name,
birthday, citizenship, passport_series, passport_number,
passport_issued_by, passport_issued_date, passport_division_code,
reg_address, live_address, snils, inn,
loan_purpose, income_source, is_pep, pep_description,
risk_level (low/medium/high), risk_reason,
status (draft/checking/approved/rejected), reject_reason,
created_at, updated_at
```

### client_checks
```
id, client_id (→ clients), check_type (rfm/passport),
result (clear/found/error/manual_required), details (jsonb), checked_at
```

### client_history
```
id, client_id (→ clients), snapshot (jsonb), changed_at
```

---

## Внешние API

| Сервис | Endpoint | Назначение |
|--------|----------|-----------|
| ФНС ЕГРЮЛ | egrul.nalog.ru/search.do?query={ИНН} | Автозаполнение профиля МФО по ИНН |
| NewDB terror | newdb.net/api/terror?fio={ФИО}&key={KEY} | Проверка по перечню РФМ |
| NewDB passport | newdb.net/api/passport?series={}&number={}&birthday={}&key={} | Проверка паспорта МВД |

## Переменные окружения (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEWDB_API_KEY=
```

---

## Соглашения по коду

- Server Components по умолчанию, `'use client'` только при необходимости стейта
- Server Actions для всех мутаций — не fetch из клиента
- Файлы компонентов: kebab-case (client-form.tsx)
- Имена компонентов: PascalCase (ClientForm)
- Именованный экспорт для компонентов
- Обработка ошибок на сервере, клиенту возвращать понятное сообщение на русском
- Все строки интерфейса на русском языке
- Кнопки основного действия: variant="default", вторичные: variant="outline"

## UX-правила

- Пользователь НЕ эксперт в compliance — подсказки и tooltips везде
- Статус compliance виден с первого экрана
- Красный = нарушение / Жёлтый = требует внимания / Зелёный = всё в порядке
- Язык интерфейса — только русский

---

## Деплой
Vercel — для прототипа. Переменные окружения в Vercel Dashboard, не в файлах.
