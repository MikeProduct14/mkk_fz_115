import { z } from 'zod'

export const organizationSchema = z.object({
  inn: z
    .string()
    .min(1, 'ИНН обязателен')
    .regex(/^\d{10}$|^\d{12}$/, 'ИНН должен содержать 10 или 12 цифр'),
  name: z.string().min(1, 'Название организации обязательно'),
  org_type: z.enum(['МКК', 'МФК'], {
    required_error: 'Выберите тип организации',
  }),
  address: z.string().optional(),
  sdl_name: z.string().optional(),
  sdl_position: z.string().optional(),
  pvk_updated_at: z.string().optional(),
})

export type OrganizationFormData = z.infer<typeof organizationSchema>
