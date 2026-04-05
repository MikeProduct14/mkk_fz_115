// Простой скрипт для проверки подключения к Supabase
// Запуск: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Проверка подключения к Supabase...\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Ошибка: переменные окружения не настроены');
  console.log('Проверьте файл .env.local');
  console.log('Должны быть заполнены:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

if (supabaseUrl.includes('your-project-ref')) {
  console.error('❌ Ошибка: URL не настроен');
  console.log('Замените "your-project-ref" на реальный URL из Supabase Dashboard');
  process.exit(1);
}

if (supabaseKey.includes('your-anon-key')) {
  console.error('❌ Ошибка: API ключ не настроен');
  console.log('Замените "your-anon-key" на реальный ключ из Supabase Dashboard');
  process.exit(1);
}

console.log('✅ Переменные окружения настроены');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔌 Проверка подключения к БД...');
    
    // Проверяем подключение через простой запрос
    const { data, error } = await supabase
      .from('organizations')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.organizations" does not exist')) {
        console.error('❌ Таблица organizations не найдена');
        console.log('');
        console.log('Выполните SQL миграцию:');
        console.log('1. Откройте Supabase Dashboard → SQL Editor');
        console.log('2. Скопируйте содержимое файла supabase/migrations/001_initial_schema.sql');
        console.log('3. Выполните SQL запрос');
        process.exit(1);
      }
      
      throw error;
    }

    console.log('✅ Подключение к БД успешно');
    console.log('✅ Таблица organizations существует');
    console.log('');
    console.log('🎉 Всё готово к работе!');
    console.log('');
    console.log('Следующие шаги:');
    console.log('1. Запустите dev сервер: npm run dev');
    console.log('2. Откройте http://localhost:3000');
    console.log('3. Зарегистрируйте тестовый аккаунт');
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    console.log('');
    console.log('Проверьте:');
    console.log('1. URL проекта правильный');
    console.log('2. API ключ правильный (anon public, не service_role)');
    console.log('3. Проект активен в Supabase Dashboard');
    process.exit(1);
  }
}

testConnection();
