# Тестирование сохранения клиента

## Подготовка

1. Откройте браузер с консолью разработчика (F12)
2. Перейдите на http://localhost:3001/dashboard/clients/new
3. Откройте вкладку Console в DevTools

## Тест 1: Сохранение черновика (минимальные данные)

### Шаги:
1. Заполните только:
   - Фамилия: Тестов
   - Имя: Тест

2. Нажмите "Сохранить черновик"

### Ожидаемый результат:
В консоли должны появиться логи:
```
=== handleSaveDraft START ===
Form data from watch(): {...}
=== dataToFormData START ===
Adding last_name: Тестов
Adding first_name: Тест
...
=== dataToFormData END ===
Calling saveClient with status: draft
=== saveClient START ===
Status: draft
FormData entries:
  last_name: Тестов
  first_name: Тест
  ...
User ID: ...
Organization ID: ...
Parsed rawData: {...}
Skipping validation (draft mode)
Client data to insert: {...}
Inserting client into database...
Client inserted successfully, ID: ...
Saving to history...
=== saveClient SUCCESS ===
saveClient result: {id: "..."}
Success! Client ID: ...
=== handleSaveDraft END ===
```

Должен появиться toast "Черновик сохранён" и редирект на страницу клиента.

## Тест 2: Сохранение с проверкой (все обязательные поля)

### Шаги:
1. Заполните все обязательные поля:
   - Фамилия: Иванов
   - Имя: Иван
   - Отчество: Иванович
   - Дата рождения: 15.03.1990 (или выберите через календарь)
   - Гражданство: Российская Федерация
   - Серия паспорта: 1234
   - Номер паспорта: 567890
   - Кем выдан: УФМС России
   - Дата выдачи: 01.01.2010
   - Код подразделения: 123-456
   - Адрес регистрации: г. Москва, ул. Тестовая, д. 1
   - Группа риска: Низкий

2. Нажмите "Сохранить и проверить клиента"

### Ожидаемый результат:
В консоли должны появиться логи:
```
=== onSubmit START ===
Form data: {...}
=== dataToFormData START ===
...
=== dataToFormData END ===
Calling saveClient with status: checking
=== saveClient START ===
Status: checking
...
Running validation...
Validation passed
Client data to insert: {...}
Inserting client into database...
Client inserted successfully, ID: ...
=== saveClient SUCCESS ===
Success! Client ID: ...
=== onSubmit END ===
```

Должен появиться toast "Клиент сохранён и отправлен на проверку" и редирект.

## Тест 3: Валидация (неполные данные)

### Шаги:
1. Заполните только:
   - Фамилия: Петров
   - Имя: Петр

2. Нажмите "Сохранить и проверить клиента"

### Ожидаемый результат:
В консоли должны появиться логи:
```
=== onSubmit START ===
...
Running validation...
Validation failed: [...]
```

Должен появиться toast с ошибками валидации.

## Возможные ошибки

### Ошибка: "Организация не найдена"
**Причина:** У пользователя нет организации в БД
**Решение:** Перейдите в /dashboard/settings и заполните профиль организации

### Ошибка: "Пользователь не авторизован"
**Причина:** Сессия истекла
**Решение:** Перелогиньтесь

### Ошибка: "Ошибка при сохранении клиента: ..."
**Причина:** Ошибка БД (смотрите детали в логе)
**Решение:** Проверьте:
- Подключение к Supabase
- RLS политики
- Структуру таблиц

## Проверка в БД

После успешного сохранения проверьте в Supabase:

1. Таблица `clients` - должна появиться новая запись
2. Таблица `client_history` - должна появиться запись с snapshot
3. Поле `status` должно быть 'draft' или 'checking' в зависимости от кнопки

## Что делать если тест не прошёл

1. Скопируйте ВСЕ логи из консоли браузера
2. Скопируйте логи из терминала где запущен dev сервер
3. Скопируйте текст ошибки из toast
4. Отправьте всё это для анализа
