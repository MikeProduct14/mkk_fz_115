import { z } from 'zod'

export const clientSchema = z
  .object({
    last_name: z.string().min(1, 'Фамилия обязательна'),
    first_name: z.string().min(1, 'Имя обязательно'),
    middle_name: z.string().optional(),
    birth_date: z.string().min(1, 'Дата рождения обязательна'),
    citizenship: z.enum(['РФ', 'иностранное', 'апатрид']).default('РФ'),
    passport_series: z.string().regex(/^\d{4}$/, 'Серия должна содержать 4 цифры'),
    passport_number: z.string().regex(/^\d{6}$/, 'Номер должен содержать 6 цифр'),
    passport_issued_by: z.string().min(1, 'Укажите, кем выдан паспорт'),
    passport_issue_date: z.string().min(1, 'Дата выдачи обязательна'),
    passport_department_code: z.string().regex(/^\d{3}-\d{3}$/, 'Код подразделения должен быть в формате 000-000'),
    registration_address: z.string().min(1, 'Адрес регистрации обязателен'),
    residential_address_same: z.boolean().default(true),
    residential_address: z.string().optional(),
    snils: z.string().optional(),
    inn: z.string().optional(),
    loan_purpose: z.string().optional(),
    income_source: z.string().optional(),
    is_pep: z.boolean().default(false),
    pep_description: z.string().optional(),
    risk_level: z.enum(['low', 'medium', 'high']).default('low'),
    risk_reason: z.string().optional(),
  })
  .refine((data) => {
    if (data.birth_date) {
      const birthDate = new Date(data.birth_date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 18
    }
    return true
  }, { message: 'Клиент должен быть старше 18 лет', path: ['birth_date'] })
  .refine((data) => !data.residential_address_same || data.residential_address, {
    message: 'Укажите адрес проживания',
    path: ['residential_address'],
  })
  .refine((data) => !data.is_pep || data.pep_description, {
    message: 'Опишите связь с публичной должностью',
    path: ['pep_description'],
  })
  .refine((data) => data.risk_level !== 'high' || data.risk_reason, {
    message: 'Укажите обоснование высокого риска',
    path: ['risk_reason'],
  })

export type ClientFormData = z.infer<typeof clientSchema>
