# Исправление DatePicker компонента

## Проблемы

1. **Смещение даты на день назад при ручном вводе** - при использовании `toISOString().split('T')[0]` происходило смещение из-за timezone
2. **Невозможность выбрать год через dropdown** - уже было исправлено добавлением `captionLayout="dropdown-buttons"`

## Решение

### 1. Использование UTC для всех операций с датами

Вместо локального timezone теперь все даты создаются и парсятся в UTC:

```typescript
// Утилита для создания даты в UTC полночь
function createUTCDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0))
}

// Утилита для парсинга строки даты в формате dd.MM.yyyy в UTC Date
function parseDate(dateString: string): Date | null {
  const parts = dateString.split('.')
  if (parts.length !== 3) return null
  
  const day = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10) - 1
  const year = parseInt(parts[2], 10)
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  
  const date = createUTCDate(year, month, day)
  
  // Проверяем что дата валидна
  if (
    date.getUTCDate() === day &&
    date.getUTCMonth() === month &&
    date.getUTCFullYear() === year
  ) {
    return date
  }
  
  return null
}
```

### 2. Форматирование даты через UTC компоненты

Вместо `format()` из date-fns используем UTC методы:

```typescript
React.useEffect(() => {
  if (value) {
    const day = String(value.getUTCDate()).padStart(2, '0')
    const month = String(value.getUTCMonth() + 1).padStart(2, '0')
    const year = value.getUTCFullYear()
    setInputValue(`${day}.${month}.${year}`)
  } else {
    setInputValue('')
  }
}, [value])
```

### 3. Конвертация Date в строку YYYY-MM-DD

В формах добавлена утилита `dateToString`:

```typescript
const dateToString = (date: Date | undefined): string => {
  if (!date) return ''
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

Используется вместо `toISOString().split('T')[0]`:

```typescript
// Было:
onChange={(date) => setValue('birth_date', date?.toISOString().split('T')[0] || '')}

// Стало:
onChange={(date) => setValue('birth_date', dateToString(date))}
```

## Изменённые файлы

1. `compliance-mfo/components/date-picker.tsx` - полностью переработан для работы с UTC
2. `compliance-mfo/app/dashboard/clients/new/page.tsx` - добавлена утилита `dateToString`
3. `compliance-mfo/app/dashboard/settings/page.tsx` - добавлена утилита `dateToString`

## Тестирование

Созданы Playwright тесты в `compliance-mfo/tests/date-picker.spec.ts`:

- Выбор года через dropdown
- Ручной ввод даты без смещения
- Ввод даты с точками
- Валидация невалидных дат
- Валидация неполных дат
- Работа с високосными годами
- Работа с датами в начале/конце года
- Ограничение ввода 10 символами
- Игнорирование нецифровых символов
- Синхронизация input и calendar

## Результат

✅ Даты больше не смещаются на день назад при ручном вводе
✅ Можно выбрать год через dropdown в календаре
✅ Все операции с датами происходят в UTC, избегая проблем с timezone
✅ Валидация дат работает корректно (високосные годы, невалидные даты)
