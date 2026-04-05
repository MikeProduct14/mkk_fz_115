'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/date-picker'
import { saveOrganization } from './actions'
import { toast } from 'sonner'

interface DadataResponse {
  status: 'active' | 'inactive' | 'not_found'
  name: string
  address: string
  manager_name: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [dadataLoading, setDadataLoading] = useState(false)
  const [inn, setInn] = useState('')
  const [name, setName] = useState('')
  const [orgType, setOrgType] = useState<'МКК' | 'МФК' | ''>('')
  const [address, setAddress] = useState('')
  const [sdlName, setSdlName] = useState('')
  const [sdlPosition, setSdlPosition] = useState('')
  const [pvkDate, setPvkDate] = useState<Date>()
  const [innError, setInnError] = useState('')

  // Утилита для конвертации Date в строку YYYY-MM-DD используя UTC
  const dateToString = (date: Date | undefined): string => {
    if (!date) return ''
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Маска для ИНН
  const handleInnChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 12) {
      setInn(cleaned)
      setInnError('')
    }
  }

  // Автозаполнение по ИНН
  const handleInnBlur = async () => {
    if (!inn || inn.length < 10) return
    if (!/^\d{10}$|^\d{12}$/.test(inn)) {
      setInnError('ИНН должен содержать 10 или 12 цифр')
      return
    }

    setDadataLoading(true)
    setInnError('')

    try {
      const response = await fetch(`/api/dadata?inn=${inn}`)
      const data: DadataResponse = await response.json()

      if (data.status === 'not_found') {
        setInnError('Организация не найдена, проверьте ИНН')
        toast.error('Организация не найдена')
      } else if (data.status === 'inactive') {
        setInnError('Организация ликвидирована или недействующая')
        toast.warning('Организация недействующая')
        // Всё равно заполняем данные
        setName(data.name)
        setAddress(data.address)
        if (data.manager_name) setSdlName(data.manager_name)
      } else {
        // Успешно - заполняем данные
        setName(data.name)
        setAddress(data.address)
        if (data.manager_name) setSdlName(data.manager_name)
        toast.success('Данные загружены из ЕГРЮЛ')
      }
    } catch (error) {
      console.error('Dadata error:', error)
      toast.error('Ошибка при загрузке данных')
    } finally {
      setDadataLoading(false)
    }
  }

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = await saveOrganization(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Профиль сохранён')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      toast.error('Произошла ошибка при сохранении')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Настройки организации</h1>
        <p className="text-muted-foreground">
          Заполните профиль вашей микрофинансовой организации
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Профиль МФО</CardTitle>
            <CardDescription>
              Данные будут использоваться для генерации документов и отчётов
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* ИНН */}
            <div className="space-y-2">
              <Label htmlFor="inn">
                ИНН организации <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="inn"
                  name="inn"
                  value={inn}
                  onChange={(e) => handleInnChange(e.target.value)}
                  onBlur={handleInnBlur}
                  placeholder="1234567890"
                  maxLength={12}
                  required
                  disabled={dadataLoading}
                />
                {dadataLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
              </div>
              {innError && (
                <p className="text-sm text-red-600">{innError}</p>
              )}
              <p className="text-sm text-muted-foreground">
                10 цифр для юрлиц, 12 для ИП. Данные загрузятся автоматически из ЕГРЮЛ
              </p>
            </div>

            {/* Название */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Название организации <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ООО МКК Пример"
                required
              />
            </div>

            {/* Тип МФО */}
            <div className="space-y-2">
              <Label htmlFor="org_type">
                Тип организации <span className="text-red-500">*</span>
              </Label>
              <Select
                value={orgType}
                onValueChange={(value) => setOrgType(value as 'МКК' | 'МФК')}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="МКК">МКК (Микрокредитная компания)</SelectItem>
                  <SelectItem value="МФК">МФК (Микрофинансовая компания)</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="org_type" value={orgType} />
            </div>

            {/* Адрес */}
            <div className="space-y-2">
              <Label htmlFor="address">Юридический адрес</Label>
              <Input
                id="address"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="г. Москва, ул. Примерная, д. 1"
              />
            </div>

            {/* ФИО СДЛ */}
            <div className="space-y-2">
              <Label htmlFor="sdl_name">ФИО ответственного лица (СДЛ)</Label>
              <Input
                id="sdl_name"
                name="sdl_name"
                value={sdlName}
                onChange={(e) => setSdlName(e.target.value)}
                placeholder="Иванов Иван Иванович"
              />
              <p className="text-sm text-muted-foreground">
                Сотрудник, ответственный за противодействие отмыванию доходов
              </p>
            </div>

            {/* Должность СДЛ */}
            <div className="space-y-2">
              <Label htmlFor="sdl_position">Должность СДЛ</Label>
              <Input
                id="sdl_position"
                name="sdl_position"
                value={sdlPosition}
                onChange={(e) => setSdlPosition(e.target.value)}
                placeholder="Главный бухгалтер"
              />
            </div>

            {/* Дата обновления ПВК */}
            <div className="space-y-2">
              <Label htmlFor="pvk_updated_at">Дата последнего обновления ПВК</Label>
              <DatePicker
                value={pvkDate}
                onChange={setPvkDate}
                placeholder="Выберите дату"
              />
              <input
                type="hidden"
                name="pvk_updated_at"
                value={dateToString(pvkDate)}
              />
              <p className="text-sm text-muted-foreground">
                ПВК должны обновляться не реже 1 раза в год
              </p>
            </div>

            {/* Кнопка сохранения */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading || dadataLoading}>
                {loading ? 'Сохранение...' : 'Сохранить и продолжить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
