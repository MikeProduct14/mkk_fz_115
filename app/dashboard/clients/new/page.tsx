'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DatePicker } from '@/components/date-picker'
import { MaskedInput } from '@/components/masked-input'
import { clientSchema, type ClientFormData } from '@/lib/validations/client'
import { saveClient } from './actions'
import { toast } from 'sonner'

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showResidentialAddress, setShowResidentialAddress] = useState(false)
  const [showPepDescription, setShowPepDescription] = useState(false)
  const [showRiskReason, setShowRiskReason] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      citizenship: 'РФ',
      residential_address_same: true,
      is_pep: false,
      risk_level: 'low',
    },
  })

  const birthDate = watch('birth_date')
  const issueDate = watch('passport_issue_date')
  const isPep = watch('is_pep')
  const riskLevel = watch('risk_level')
  const residentialAddressSame = watch('residential_address_same')

  // Обработка изменения чекбокса адреса
  const handleAddressCheckChange = (checked: boolean) => {
    setValue('residential_address_same', checked)
    setShowResidentialAddress(!checked)
  }

  // Обработка изменения ПЭП
  const handlePepChange = (checked: boolean) => {
    setValue('is_pep', checked)
    setShowPepDescription(checked)
  }

  // Обработка изменения уровня риска
  const handleRiskLevelChange = (value: 'low' | 'medium' | 'high') => {
    setValue('risk_level', value)
    setShowRiskReason(value === 'high')
  }

  // Утилита для конвертации данных формы в FormData
  const dataToFormData = (data: any): FormData => {
    console.log('=== dataToFormData START ===')
    console.log('Input data:', data)
    
    const formData = new FormData()
    
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        console.log(`Skipping empty field: ${key}`)
        return // Пропускаем пустые значения
      }
      
      // Булевы значения конвертируем в строки
      if (typeof value === 'boolean') {
        console.log(`Converting boolean ${key}: ${value} -> "${value ? 'true' : 'false'}"`)
        formData.append(key, value ? 'true' : 'false')
      } else {
        console.log(`Adding ${key}: ${value}`)
        formData.append(key, String(value))
      }
    })
    
    console.log('=== dataToFormData END ===')
    return formData
  }

  // Сохранение черновика (без валидации)
  const handleSaveDraft = async () => {
    console.log('=== handleSaveDraft START ===')
    setLoading(true)
    
    try {
      const data = watch()
      console.log('Form data from watch():', data)
      
      const formData = dataToFormData(data)
      console.log('Calling saveClient with status: draft')
      
      const result = await saveClient(formData, 'draft')
      console.log('saveClient result:', result)
      
      if (result.error) {
        console.error('Error from saveClient:', result.error)
        toast.error(result.error)
      } else {
        console.log('Success! Client ID:', result.id)
        toast.success('Черновик сохранён')
        router.push(`/dashboard/clients/${result.id}`)
      }
    } catch (error) {
      console.error('Exception in handleSaveDraft:', error)
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setLoading(false)
      console.log('=== handleSaveDraft END ===')
    }
  }

  // Сохранение с проверкой (с валидацией)
  const onSubmit = async (data: ClientFormData) => {
    console.log('=== onSubmit START ===')
    console.log('Form data:', data)
    setLoading(true)
    
    try {
      const formData = dataToFormData(data)
      console.log('Calling saveClient with status: checking')
      
      const result = await saveClient(formData, 'checking')
      console.log('saveClient result:', result)
      
      if (result.error) {
        console.error('Error from saveClient:', result.error)
        toast.error(result.error)
      } else {
        console.log('Success! Client ID:', result.id)
        toast.success('Клиент сохранён и отправлен на проверку')
        router.push(`/dashboard/clients/${result.id}`)
      }
    } catch (error) {
      console.error('Exception in onSubmit:', error)
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setLoading(false)
      console.log('=== onSubmit END ===')
    }
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Новая анкета клиента</h1>
          <p className="text-muted-foreground">
            Заполните данные для проверки по ФЗ-115
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Секция 1: Личные данные */}
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
              <CardDescription>Основная информация о клиенте</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    Фамилия <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    {...register('last_name')}
                    placeholder="Иванов"
                  />
                  {errors.last_name && (
                    <p className="text-sm text-red-600">{errors.last_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Имя <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    {...register('first_name')}
                    placeholder="Иван"
                  />
                  {errors.first_name && (
                    <p className="text-sm text-red-600">{errors.first_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_name">Отчество</Label>
                  <Input
                    id="middle_name"
                    {...register('middle_name')}
                    placeholder="Иванович"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birth_date">
                    Дата рождения <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={birthDate ? new Date(birthDate) : undefined}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setValue('birth_date', `${year}-${month}-${day}`)
                      } else {
                        setValue('birth_date', '')
                      }
                    }}
                    placeholder="Выберите дату"
                  />
                  {errors.birth_date && (
                    <p className="text-sm text-red-600">{errors.birth_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="citizenship">
                    Гражданство <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('citizenship')}
                    onValueChange={(value) => setValue('citizenship', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите гражданство" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="РФ">Российская Федерация</SelectItem>
                      <SelectItem value="иностранное">Иностранное гражданство</SelectItem>
                      <SelectItem value="апатрид">Лицо без гражданства</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.citizenship && (
                    <p className="text-sm text-red-600">{errors.citizenship.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Секция 2: Паспортные данные */}
          <Card>
            <CardHeader>
              <CardTitle>Паспортные данные</CardTitle>
              <CardDescription>Документ, удостоверяющий личность</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passport_series">
                    Серия паспорта <span className="text-red-500">*</span>
                  </Label>
                  <MaskedInput
                    id="passport_series"
                    mask="9999"
                    value={watch('passport_series')}
                    onChange={(value) => setValue('passport_series', value)}
                    placeholder="0000"
                  />
                  {errors.passport_series && (
                    <p className="text-sm text-red-600">{errors.passport_series.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport_number">
                    Номер паспорта <span className="text-red-500">*</span>
                  </Label>
                  <MaskedInput
                    id="passport_number"
                    mask="999999"
                    value={watch('passport_number')}
                    onChange={(value) => setValue('passport_number', value)}
                    placeholder="000000"
                  />
                  {errors.passport_number && (
                    <p className="text-sm text-red-600">{errors.passport_number.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passport_issued_by">
                  Кем выдан <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="passport_issued_by"
                  {...register('passport_issued_by')}
                  placeholder="Отделением УФМС России"
                />
                {errors.passport_issued_by && (
                  <p className="text-sm text-red-600">{errors.passport_issued_by.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passport_issue_date">
                    Дата выдачи <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={issueDate ? new Date(issueDate) : undefined}
                    onChange={(date) => {
                      if (date) {
                        const year = date.getFullYear()
                        const month = String(date.getMonth() + 1).padStart(2, '0')
                        const day = String(date.getDate()).padStart(2, '0')
                        setValue('passport_issue_date', `${year}-${month}-${day}`)
                      } else {
                        setValue('passport_issue_date', '')
                      }
                    }}
                    placeholder="Выберите дату"
                  />
                  {errors.passport_issue_date && (
                    <p className="text-sm text-red-600">{errors.passport_issue_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passport_department_code">
                    Код подразделения <span className="text-red-500">*</span>
                  </Label>
                  <MaskedInput
                    id="passport_department_code"
                    mask="999-999"
                    value={watch('passport_department_code')}
                    onChange={(value) => setValue('passport_department_code', value)}
                    placeholder="000-000"
                    returnMasked={true}
                  />
                  {errors.passport_department_code && (
                    <p className="text-sm text-red-600">{errors.passport_department_code.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registration_address">
                  Адрес регистрации <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="registration_address"
                  {...register('registration_address')}
                  placeholder="г. Москва, ул. Примерная, д. 1, кв. 1"
                  rows={2}
                />
                {errors.registration_address && (
                  <p className="text-sm text-red-600">{errors.registration_address.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="residential_address_same"
                  checked={residentialAddressSame}
                  onCheckedChange={handleAddressCheckChange}
                />
                <Label htmlFor="residential_address_same" className="cursor-pointer">
                  Адрес проживания совпадает с адресом регистрации
                </Label>
              </div>

              {showResidentialAddress && (
                <div className="space-y-2">
                  <Label htmlFor="residential_address">
                    Адрес проживания <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="residential_address"
                    {...register('residential_address')}
                    placeholder="г. Москва, ул. Другая, д. 2, кв. 2"
                    rows={2}
                  />
                  {errors.residential_address && (
                    <p className="text-sm text-red-600">{errors.residential_address.message}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snils">СНИЛС</Label>
                  <MaskedInput
                    id="snils"
                    mask="999-999-999 99"
                    value={watch('snils')}
                    onChange={(value) => setValue('snils', value)}
                    placeholder="000-000-000 00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inn">ИНН</Label>
                  <MaskedInput
                    id="inn"
                    mask="99999999999"
                    value={watch('inn')}
                    onChange={(value) => setValue('inn', value)}
                    placeholder="00000000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Секция 3: Оценка риска */}
          <Card>
            <CardHeader>
              <CardTitle>Оценка риска</CardTitle>
              <CardDescription>Информация для определения риск-профиля клиента</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="loan_purpose">Цель займа</Label>
                  <Select
                    value={watch('loan_purpose') || ''}
                    onValueChange={(value) => setValue('loan_purpose', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите цель" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Личные нужды">Личные нужды</SelectItem>
                      <SelectItem value="Лечение">Лечение</SelectItem>
                      <SelectItem value="Образование">Образование</SelectItem>
                      <SelectItem value="Ремонт">Ремонт</SelectItem>
                      <SelectItem value="Бизнес">Бизнес</SelectItem>
                      <SelectItem value="Другое">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="income_source">Источник дохода</Label>
                  <Select
                    value={watch('income_source') || ''}
                    onValueChange={(value) => setValue('income_source', value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите источник" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Заработная плата">Заработная плата</SelectItem>
                      <SelectItem value="Пенсия">Пенсия</SelectItem>
                      <SelectItem value="Предпринимательство">Предпринимательство</SelectItem>
                      <SelectItem value="Самозанятость">Самозанятость</SelectItem>
                      <SelectItem value="Другое">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_pep"
                    checked={isPep}
                    onCheckedChange={handlePepChange}
                  />
                  <Label htmlFor="is_pep" className="cursor-pointer">
                    Является ли публично значимым лицом (ПЭП)
                  </Label>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">
                        ?
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Публично значимые лица: чиновники, судьи, военные от определённого ранга,
                        их ближайшие родственники
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {showPepDescription && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="pep_description">
                      Опишите связь с публичной должностью <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="pep_description"
                      {...register('pep_description')}
                      placeholder="Укажите должность, ведомство, степень родства"
                      rows={3}
                    />
                    {errors.pep_description && (
                      <p className="text-sm text-red-600">{errors.pep_description.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Группа риска <span className="text-red-500">*</span>
                </Label>
                <RadioGroup
                  value={riskLevel}
                  onValueChange={handleRiskLevelChange}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="risk-low" />
                    <Label htmlFor="risk-low" className="cursor-pointer font-normal">
                      Низкий
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">
                          ?
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Стандартный клиент без признаков повышенного риска</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="risk-medium" />
                    <Label htmlFor="risk-medium" className="cursor-pointer font-normal">
                      Средний
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">
                          ?
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Нерезидент, нестандартная цель займа, косвенные признаки</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="risk-high" />
                    <Label htmlFor="risk-high" className="cursor-pointer font-normal">
                      Высокий
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">
                          ?
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ПЭП, высокорисковая страна, отказ объяснять источник средств</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </RadioGroup>
                {errors.risk_level && (
                  <p className="text-sm text-red-600">{errors.risk_level.message}</p>
                )}

                {showRiskReason && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="risk_reason">
                      Обоснование высокого риска <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="risk_reason"
                      {...register('risk_reason')}
                      placeholder="Укажите причины отнесения клиента к высокорисковой группе"
                      rows={3}
                    />
                    {errors.risk_reason && (
                      <p className="text-sm text-red-600">{errors.risk_reason.message}</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sticky кнопки внизу */}
          <div className="fixed bottom-0 left-64 right-0 border-t bg-background p-4">
            <div className="flex gap-4 max-w-4xl">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={loading}
              >
                Сохранить черновик
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить и проверить клиента'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/dashboard/clients')}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  )
}
