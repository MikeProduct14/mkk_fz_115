'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'

export async function updateClient(clientId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Пользователь не авторизован' }
  }

  // Парсим данные
  const rawData = {
    last_name: formData.get('last_name') as string,
    first_name: formData.get('first_name') as string,
    middle_name: formData.get('middle_name') as string,
    birthday: formData.get('birth_date') as string,
    citizenship: formData.get('citizenship') as string,
    passport_series: formData.get('passport_series') as string,
    passport_number: formData.get('passport_number') as string,
    passport_issued_by: formData.get('passport_issued_by') as string,
    passport_issued_date: formData.get('passport_issue_date') as string,
    passport_division_code: formData.get('passport_department_code') as string,
    reg_address: formData.get('registration_address') as string,
    residential_address_same: formData.get('residential_address_same') === 'true',
    live_address: formData.get('residential_address') as string,
    snils: formData.get('snils') as string,
    inn: formData.get('inn') as string,
    loan_purpose: formData.get('loan_purpose') as string,
    income_source: formData.get('income_source') as string,
    is_pep: formData.get('is_pep') === 'true',
    pep_description: formData.get('pep_description') as string,
    risk_level: formData.get('risk_level') as 'low' | 'medium' | 'high',
    risk_reason: formData.get('risk_reason') as string,
  }

  // Валидация
  const dataForValidation = {
    last_name: rawData.last_name,
    first_name: rawData.first_name,
    middle_name: rawData.middle_name,
    birth_date: rawData.birthday,
    citizenship: rawData.citizenship,
    passport_series: rawData.passport_series,
    passport_number: rawData.passport_number,
    passport_issued_by: rawData.passport_issued_by,
    passport_issue_date: rawData.passport_issued_date,
    passport_department_code: rawData.passport_division_code,
    registration_address: rawData.reg_address,
    residential_address_same: rawData.residential_address_same,
    residential_address: rawData.live_address,
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
    const errors = validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { error: errors }
  }

  // Обновление в БД
  const clientData = {
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
  }

  const { error } = await supabase
    .from('clients')
    .update(clientData)
    .eq('id', clientId)

  if (error) {
    return { error: `Ошибка при обновлении: ${error.message}` }
  }

  // Сохранение в историю
  await supabase.from('client_history').insert({
    client_id: clientId,
    snapshot: clientData,
  })

  revalidatePath('/dashboard/clients')
  revalidatePath(`/dashboard/clients/${clientId}`)

  return { success: true }
}
