# Инструкция по деплою на GitHub

Проект готов к деплою! Все изменения закоммичены.

## Шаг 1: Создайте репозиторий на GitHub

1. Откройте https://github.com/new
2. Заполните форму:
   - **Repository name**: `compliance-mfo` (или любое другое имя)
   - **Description**: "Система автоматизации compliance по ФЗ-115 для МФО"
   - **Visibility**: Private (рекомендуется, так как содержит бизнес-логику)
   - **НЕ** инициализируйте с README, .gitignore или лицензией (они уже есть)
3. Нажмите "Create repository"

## Шаг 2: Подключите remote и запушьте код

После создания репозитория GitHub покажет инструкции. Выполните в терминале:

```bash
cd compliance-mfo

# Добавьте remote (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/compliance-mfo.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/compliance-mfo.git

# Запушьте код
git push -u origin main
```

## Шаг 3: Проверьте что всё загрузилось

Откройте ваш репозиторий на GitHub и убедитесь что все файлы на месте.

## Важно: Секретные данные

Убедитесь что файлы `.env.local` и `.env.test` **НЕ** попали в репозиторий!
Они уже добавлены в `.gitignore`, но проверьте на GitHub что их там нет.

## Альтернатива: Использование GitHub CLI

Если у вас установлен GitHub CLI (`gh`), можно создать репозиторий одной командой:

```bash
cd compliance-mfo

# Создать приватный репозиторий и запушить
gh repo create compliance-mfo --private --source=. --push

# Или публичный
gh repo create compliance-mfo --public --source=. --push
```

## Следующие шаги

После деплоя на GitHub вы можете:

1. **Настроить GitHub Actions** для автоматического запуска тестов
2. **Задеплоить на Vercel**:
   ```bash
   # Установите Vercel CLI
   npm i -g vercel
   
   # Задеплойте
   vercel
   ```
3. **Добавить коллабораторов** в Settings → Collaborators
4. **Настроить branch protection** для main ветки

## Текущий статус

✅ Все файлы закоммичены
✅ .gitignore настроен правильно
✅ README.md создан
✅ Документация готова
✅ Тесты включены в репозиторий

Готово к пушу!
