'use client'

import { useState, useEffect } from 'react'
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
      if (value === undefined || value === null || value === '') {
        return
      }
      
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
        toast.success('Клиент обновлён')
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
          {/* Копируем всю структуру формы из new/page.tsx */}
          {/* Для краткости показываю только основные поля */}
          
          <Card>
            <CardHeader>
              <CardTitle>Личные данные</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="last_name">Фамилия <span className="text-red-500">*</span></Label>
                  <Input id="last_name" {...register('last_name')} />
                  {errors.last_name && <p className="text-sm text-red-600">{errors.last_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="first_name">Имя <span className="text-red-500">*</span></Label>
                  <Input id="first_name" {...register('first_name')} />
                  {errors.first_name && <p className="text-sm text-red-600">{errors.first_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middle_name">Отчество</Label>
                  <Input id="middle_name" {...register('middle_name')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Дата рождения <span className="text-red-500">*</span></Label>
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
                  <Label>Гражданство <span className="text-red-500">*</span></Label>
                  <Select
                    value={watch('citizenship')}
                    onValueChange={(value) => setValue('citizenship', value as any)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="РФ">Российская Федерация</SelectItem>
                      <SelectItem value="иностранное">Иностранное гражданство</SelectItem>
                      <SelectItem value="апатрид">Лицо без гражданства</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

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
