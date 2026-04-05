'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'

export async function saveClient(
  formData: FormData,
  status: 'draft' | 'checking'
) {
  console.log('=== saveClient START ===')
  console.log('Status:', status)
  console.log('FormData entries:')
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}:`, value)
  }

  const supabase = await createClient()

  // Получаем текущего пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('User not authenticated')
    return { error: 'Пользователь не авторизован' }
  }

  console.log('User ID:', user.id)

  // Получаем организацию пользователя
  const { data: organization, error: orgError } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (orgError) {
    console.error('Organization query error:', orgError)
  }

  if (!organization) {
    console.error('Organization not found for user:', user.id)
    return { error: 'Организация не найдена. Заполните профиль в настройках.' }
  }

  console.log('Organization ID:', organization.id)

  // Парсим данные формы
  const rawData = {
    last_name: formData.get('last_name') as string,
    first_name: formData.get('first_name') as string,
    middle_name: formData.get('middle_name') as string,
    birthday: formData.get('birth_date') as string, // Маппинг birth_date -> birthday
    citizenship: formData.get('citizenship') as string,
    passport_series: formData.get('passport_series') as string,
    passport_number: formData.get('passport_number') as string,
    passport_issued_by: formData.get('passport_issued_by') as string,
    passport_issued_date: formData.get('passport_issue_date') as string, // Маппинг passport_issue_date -> passport_issued_date
    passport_division_code: formData.get('passport_department_code') as string, // Маппинг passport_department_code -> passport_division_code
    reg_address: formData.get('registration_address') as string, // Маппинг registration_address -> reg_address
    residential_address_same: formData.get('residential_address_same') === 'true',
    live_address: formData.get('residential_address') as string, // Маппинг residential_address -> live_address
    snils: formData.get('snils') as string,
    inn: formData.get('inn') as string,
    loan_purpose: formData.get('loan_purpose') as string,
    income_source: formData.get('income_source') as string,
    is_pep: formData.get('is_pep') === 'true',
    pep_description: formData.get('pep_description') as string,
    risk_level: formData.get('risk_level') as 'low' | 'medium' | 'high',
    risk_reason: formData.get('risk_reason') as string,
  }

  console.log('Parsed rawData:', JSON.stringify(rawData, null, 2))

  // Валидация только для статуса 'checking'
  if (status === 'checking') {
    console.log('Running validation...')
    
    // Для валидации нужно преобразовать обратно в формат который ожидает clientSchema
    const dataForValidation = {
      last_name: rawData.last_name,
      first_name: rawData.first_name,
      middle_name: rawData.middle_name,
      birth_date: rawData.birthday, // Обратный маппинг
      citizenship: rawData.citizenship,
      passport_series: rawData.passport_series,
      passport_number: rawData.passport_number,
      passport_issued_by: rawData.passport_issued_by,
      passport_issue_date: rawData.passport_issued_date, // Обратный маппинг
      passport_department_code: rawData.passport_division_code, // Обратный маппинг
      registration_address: rawData.reg_address, // Обратный маппинг
      residential_address_same: rawData.residential_address_same,
      residential_address: rawData.live_address, // Обратный маппинг
      snils: rawData.snils,
      inn: rawData.inn,
      loan_purpose: rawData.loan_purpose,
      income_source: rawData.income_source,
      is_pep: rawData.is_pep,
      pep_description: rawData.pep_description,
      risk_level: rawData.risk_level,
      risk_reason: rawData.risk_reason,
    }
    
    const validation = clientSchema.safeParse(dataForValidation)

    if (!validation.success) {
      console.error('Validation failed:', validation.error.errors)
      const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return { error: errors }
    }
    console.log('Validation passed')
  } else {
    console.log('Skipping validation (draft mode)')
  }

  // Подготовка данных для вставки (используем названия колонок из БД)
  const clientData = {
    org_id: organization.id,
    last_name: rawData.last_name || null,
    first_name: rawData.first_name || null,
    middle_name: rawData.middle_name || null,
    birthday: rawData.birthday || null,
    citizenship: rawData.citizenship || null,
    passport_series: rawData.passport_series || null,
    passport_number: rawData.passport_number || null,
    passport_issued_by: rawData.passport_issued_by || null,
    passport_issued_date: rawData.passport_issued_date || null,
    passport_division_code: rawData.passport_division_code || null,
    reg_address: rawData.reg_address || null,
    live_address: rawData.residential_address_same
      ? rawData.reg_address
      : rawData.live_address || null,
    snils: rawData.snils || null,
    inn: rawData.inn || null,
    loan_purpose: rawData.loan_purpose || null,
    income_source: rawData.income_source || null,
    is_pep: rawData.is_pep,
    pep_description: rawData.pep_description || null,
    risk_level: rawData.risk_level || 'low',
    risk_reason: rawData.risk_reason || null,
    status,
  }

  console.log('Client data to insert:', JSON.stringify(clientData, null, 2))

  // Вставка клиента
  console.log('Inserting client into database...')
  const { data: client, error: insertError } = await supabase
    .from('clients')
    .insert(clientData)
    .select('id')
    .single()

  if (insertError) {
    console.error('Supabase insert error:', insertError)
    return { error: `Ошибка при сохранении клиента: ${insertError.message}` }
  }

  console.log('Client inserted successfully, ID:', client.id)

  // Сохранение snapshot в историю
  console.log('Saving to history...')
  const { error: historyError } = await supabase.from('client_history').insert({
    client_id: client.id,
    snapshot: clientData,
  })

  if (historyError) {
    console.error('History insert error:', historyError)
  }

  // Инвалидируем кэш
  revalidatePath('/dashboard/clients')

  // Если статус 'checking' — запускаем проверки асинхронно (не ждём)
  if (status === 'checking') {
    const fio = [rawData.last_name, rawData.first_name, rawData.middle_name]
      .filter(Boolean)
      .join(' ')

    // Запускаем проверку в фоне (fire-and-forget)
    runChecks(supabase, client.id, fio, rawData.birthday, rawData.passport_series, rawData.passport_number)
  }

  console.log('=== saveClient SUCCESS ===')
  return { id: client.id }
}

// Фоновая функция проверки — не блокирует ответ
async function runChecks(
  supabase: any,
  clientId: string,
  fio: string,
  birthday: string,
  passportSeries: string,
  passportNumber: string
) {
  const NEWDB_KEY = process.env.NEWDB_API_KEY
  if (!NEWDB_KEY) return

  async function checkRFM() {
    try {
      const res = await fetch(
        `https://newdb.net/api/terror?fio=${encodeURIComponent(fio)}&key=${NEWDB_KEY}`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!res.ok) return { result: 'error' as const }
      const data = await res.json()
      return data.found ? { result: 'found' as const, details: data.details } : { result: 'clear' as const }
    } catch {
      return { result: 'error' as const }
    }
  }

  async function checkPassport() {
    try {
      const res = await fetch(
        `https://newdb.net/api/passport?series=${passportSeries}&number=${passportNumber}&birthday=${birthday}&key=${NEWDB_KEY}`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!res.ok) return { result: 'error' as const }
      const data = await res.json()
      return data.valid ? { result: 'clear' as const } : { result: 'found' as const, details: data }
    } catch {
      return { result: 'error' as const }
    }
  }

  const [rfm, passport] = await Promise.all([checkRFM(), checkPassport()])

  await supabase.from('client_checks').insert([
    { client_id: clientId, check_type: 'rfm', result: rfm.result, details: rfm.details ?? null },
    { client_id: clientId, check_type: 'passport', result: passport.result, details: passport.details ?? null },
  ])

  let newStatus: 'approved' | 'rejected' | 'draft' = 'approved'
  let rejectReason: string | null = null

  if (rfm.result === 'found') {
    newStatus = 'rejected'
    rejectReason = 'Клиент найден в перечне РФМ'
  } else if (passport.result === 'found') {
    newStatus = 'rejected'
    rejectReason = 'Паспорт недействителен'
  } else if (rfm.result === 'error' || passport.result === 'error') {
    newStatus = 'draft'
  }

  await supabase
    .from('clients')
    .update({ status: newStatus, reject_reason: rejectReason })
    .eq('id', clientId)
}
