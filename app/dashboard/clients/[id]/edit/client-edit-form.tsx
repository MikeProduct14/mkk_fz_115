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
import { updateClient } from './actions'
import { toast } from 'sonner'

interface ClientEditFormProps {
  client: any
}

export function ClientEditForm({ client }: ClientEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showResidentialAddress, setShowResidentialAddress] = useState(!client.residential_address_same)
  const [showPepDescription, setShowPepDescription] = useState(client.is_pep)
  const [showRiskReason, setShowRiskReason] = useState(client.risk_level === 'high')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema) as any,
    defaultValues: {
      last_name: client.last_name || '',
      first_name: client.first_name || '',
      middle_name: client.middle_name || '',
      birth_date: client.birthday || '',
      citizenship: client.citizenship || 'РФ',
      passport_series: client.passport_series || '',
      passport_number: client.passport_number || '',
      passport_issued_by: client.passport_issued_by || '',
      passport_issue_date: client.passport_issued_date || '',
      passport_department_code: client.passport_division_code || '',
      registration_address: client.reg_address || '',
      residential_address_same: client.residential_address_same ?? true,
      residential_address: client.live_address || '',
      snils: client.snils || '',
      inn: client.inn || '',
      loan_purpose: client.loan_purpose || '',
      income_source: client.income_source || '',
      is_pep: client.is_pep || false,
      pep_description: client.pep_description || '',
      risk_level: client.risk_level || 'low',
      risk_reason: client.risk_reason || '',
    },
  })

  const birthDate = watch('birth_date')
  const issueDate = watch('passport_issue_date')
  const isPep = watch('is_pep')
  const riskLevel = watch('risk_level')
  const residentialAddressSame = watch('residential_address_same')

  const handleAddressCheckChange = (checked: boolean) => {
    setValue('residential_address_same', checked)
    setShowResidentialAddress(!checked)
  }

  const handlePepChange = (checked: boolean) => {
    setValue('is_pep', checked)
    setShowPepDescription(checked)
  }

  const handleRiskLevelChange = (value: 'low' | 'medium' | 'high') => {
    setValue('risk_level', value)
    setShowRiskReason(value === 'high')
  }

  const dataToFormData = (data: any): FormData => {
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return
      if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false')
      } else {
        formData.append(key, String(value))
      }
    })
    return formData
  }

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true)
    try {
      const formData = dataToFormData(data)
      const result = await updateClient(client.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Анкета обновлена')
        router.push(`/dashboard/clients/${client.id}`)
      }
    } catch (error) {
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="max-w-4xl pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Редактирование анкеты</h1>
          <p className="text-muted-foreground">
            {client.last_name} {client.first_name} {client.middle_name}
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
                  <Input id="last_name" {...register('last_name')} placeholder="Иванов" />
                  {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    Имя <span className="text-red-500">*</span>
                  </Label>
                  <Input id="first_name" {...register('first_name')} placeholder="Иван" />
                  {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Отчество</Label>
                  <Input id="middle_name" {...register('middle_name')} placeholder="Иванович" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
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
                  />
                  {errors.birth_date && <p className="text-sm text-red-600">{errors.birth_date.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>
                    Гражданство <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('citizenship')}
                    onValueChange={(value) => setValue('citizenship', value as any)}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите гражданство" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="РФ">Российская Федерация</SelectItem>
                      <SelectItem value="иностранное">Иностранное гражданство</SelectItem>
                      <SelectItem value="апатрид">Лицо без гражданства</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.citizenship && <p className="text-sm text-red-600">{errors.citizenship.message}</p>}
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
                  {errors.passport_series && <p className="text-sm text-red-600">{errors.passport_series.message}</p>}
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
                  {errors.passport_number && <p className="text-sm text-red-600">{errors.passport_number.message}</p>}
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
                {errors.passport_issued_by && <p className="text-sm text-red-600">{errors.passport_issued_by.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
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
                  />
                  {errors.passport_issue_date && <p className="text-sm text-red-600">{errors.passport_issue_date.message}</p>}
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
                  {errors.passport_department_code && <p className="text-sm text-red-600">{errors.passport_department_code.message}</p>}
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
                {errors.registration_address && <p className="text-sm text-red-600">{errors.registration_address.message}</p>}
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
                  {errors.residential_address && <p className="text-sm text-red-600">{errors.residential_address.message}</p>}
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
                  <Label>Цель займа</Label>
                  <Select
                    value={watch('loan_purpose') || ''}
                    onValueChange={(value) => setValue('loan_purpose', value || undefined)}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите цель" /></SelectTrigger>
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
                  <Label>Источник дохода</Label>
                  <Select
                    value={watch('income_source') || ''}
                    onValueChange={(value) => setValue('income_source', value || undefined)}
                  >
                    <SelectTrigger><SelectValue placeholder="Выберите источник" /></SelectTrigger>
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

              <div className={`rounded-lg border p-4 transition-colors ${isPep ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/20' : 'border-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="is_pep" className="cursor-pointer font-medium">
                      Публично значимое лицо (ПЭП)
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
                  <Switch
                    id="is_pep"
                    checked={isPep}
                    onCheckedChange={handlePepChange}
                  />
                </div>
                {!isPep && (
                  <p className="mt-1 text-sm text-muted-foreground">Не является</p>
                )}
                {isPep && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Требуется углублённая проверка клиента
                    </p>
                    <Label htmlFor="pep_description">
                      Опишите связь с публичной должностью <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="pep_description"
                      {...register('pep_description')}
                      placeholder="Укажите должность, ведомство, степень родства"
                      rows={3}
                    />
                    {errors.pep_description && <p className="text-sm text-red-600">{errors.pep_description.message}</p>}
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
                    <RadioGroupItem value="low" id="edit-risk-low" />
                    <Label htmlFor="edit-risk-low" className="cursor-pointer font-normal">
                      Низкий
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Стандартный клиент без признаков повышенного риска</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="edit-risk-medium" />
                    <Label htmlFor="edit-risk-medium" className="cursor-pointer font-normal">
                      Средний
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Нерезидент, нестандартная цель займа, косвенные признаки</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="edit-risk-high" />
                    <Label htmlFor="edit-risk-high" className="cursor-pointer font-normal">
                      Высокий
                    </Label>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs text-muted-foreground hover:bg-muted">?</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>ПЭП, высокорисковая страна, отказ объяснять источник средств</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </RadioGroup>
                {errors.risk_level && <p className="text-sm text-red-600">{errors.risk_level.message}</p>}

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
                    {errors.risk_reason && <p className="text-sm text-red-600">{errors.risk_reason.message}</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sticky кнопки внизу */}
          <div className="fixed bottom-0 left-64 right-0 border-t bg-background p-4">
            <div className="flex gap-4 max-w-4xl">
              <Button type="submit" disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
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
