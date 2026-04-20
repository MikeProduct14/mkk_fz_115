'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { organizationSchema } from '@/lib/validations/organization'

export async function saveOrganization(formData: FormData) {
  const supabase = await createClient()

  // Получаем текущего пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Пользователь не авторизован' }
  }

  // Парсим данные формы
  const rawData = {
    inn: formData.get('inn') as string,
    name: formData.get('name') as string,
    org_type: formData.get('org_type') as string,
    address: formData.get('address') as string,
    sdl_name: formData.get('sdl_name') as string,
    sdl_position: formData.get('sdl_position') as string,
    pvk_updated_at: formData.get('pvk_updated_at') as string,
  }

  // Валидация
  const validation = organizationSchema.safeParse(rawData)

  if (!validation.success) {
    const errors = validation.error.issues.map((e: any) => e.message).join(', ')
    return { error: errors }
  }

  const data = validation.data

  // Upsert в БД
  const { error } = await supabase
    .from('organizations')
    .upsert(
      {
        user_id: user.id,
        inn: data.inn,
        name: data.name,
        org_type: data.org_type,
        address: data.address || null,
        sdl_name: data.sdl_name || null,
        sdl_position: data.sdl_position || null,
        pvk_updated_at: data.pvk_updated_at || null,
      },
      {
        onConflict: 'user_id',
      }
    )

  if (error) {
    console.error('Supabase error:', error)
    return { error: 'Ошибка при сохранении данных' }
  }

  // Инвалидируем кэш
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/settings')

  return { success: true }
}
