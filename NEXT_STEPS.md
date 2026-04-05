# Следующие шаги

Проект Compliance MFO успешно инициализирован! ✅

## Что уже сделано

1. ✅ Next.js 14 с TypeScript и App Router
2. ✅ Supabase клиенты (browser + server)
3. ✅ Middleware для защиты роутов
4. ✅ SQL миграция с 4 таблицами и RLS политиками
5. ✅ shadcn/ui + Tailwind CSS
6. ✅ Zod валидация для анкеты клиента
7. ✅ TypeScript типы для БД
8. ✅ Структура страниц (auth + dashboard)
9. ✅ API routes (заглушки)
10. ✅ Базовые компоненты UI

## Что нужно сделать дальше

### 1. Настроить Supabase (5 минут)

```bash
# 1. Создайте проект на supabase.com
# 2. Выполните миграцию из supabase/migrations/001_initial_schema.sql
# 3. Скопируйте URL и Anon Key в .env.local
```

### 2. Запустить проект

```bash
cd compliance-mfo
npm run dev
```

Откройте http://localhost:3000

### 3. Разработка функционала (по приоритету)

#### Этап 1: Базовая функциональность
- [ ] Форма настроек организации с автозаполнением по ИНН (ФНС API)
- [ ] Форма добавления клиента с валидацией
- [ ] Список клиентов с фильтрами

#### Этап 2: Проверки
- [ ] Интеграция NewDB API для проверки РФМ
- [ ] Интеграция NewDB API для проверки паспорта МВД
- [ ] Автоматическое присвоение группы риска
- [ ] Отображение результатов проверок

#### Этап 3: PDF генерация
- [ ] Шаблон досье клиента (@react-pdf/renderer)
- [ ] Шаблон ПВК
- [ ] Скачивание PDF файлов

#### Этап 4: UI/UX
- [ ] Добавить компоненты: Input, Select, Textarea, Card
- [ ] Уведомления (toast)
- [ ] Загрузочные состояния
- [ ] Обработка ошибок

## Полезные команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Запуск production
npm start

# Линтинг
npm run lint

# Добавить shadcn/ui компонент
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add card
```

## Документация

- [README.md](./README.md) - общее описание
- [SETUP.md](./SETUP.md) - детальная инструкция по настройке
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - статус разработки

## Структура проекта

```
compliance-mfo/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Аутентификация
│   ├── (dashboard)/       # Защищённые страницы
│   └── api/               # API routes
├── components/ui/         # shadcn/ui компоненты
├── lib/                   # Утилиты
│   ├── supabase/         # Supabase клиенты
│   └── validations/      # Zod схемы
└── supabase/migrations/  # SQL миграции
```

## Контакты и поддержка

При возникновении вопросов:
1. Проверьте SETUP.md
2. Проверьте логи в консоли браузера
3. Проверьте логи Next.js в терминале
