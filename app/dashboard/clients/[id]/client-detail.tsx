'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type CheckResult = 'clear' | 'found' | 'error' | 'manual_required'
type ClientStatus = 'draft' | 'checking' | 'approved' | 'rejected'

interface Check {
  id: string
  check_type: 'rfm' | 'passport'
  result: CheckResult
  details: any
  checked_at: string
}

interface Client {
  id: string
  last_name: string
  first_name: string
  middle_name: string | null
  birthday: string | null
  citizenship: string | null
  passport_series: string | null
  passport_number: string | null
  passport_issued_by: string | null
  passport_issued_date: string | null
  passport_division_code: string | null
  reg_address: string | null
  live_address: string | null
  snils: string | null
  inn: string | null
  loan_purpose: string | null
  income_source: string | null
  is_pep: boolean
  pep_description: string | null
  risk_level: 'low' | 'medium' | 'high'
  risk_reason: string | null
  status: ClientStatus
  reject_reason: string | null
  created_at: string
  updated_at: string
}

const STATUS_LABELS: Record<ClientStatus, string> = {
  draft: 'Черновик',
  checking: 'Проверяется...',
  approved: 'Одобрен',
  rejected: 'Отказ',
}

const STATUS_VARIANTS: Record<ClientStatus, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  checking: 'default',
  approved: 'default',
  rejected: 'destructive',
}

const CHECK_LABELS: Record<string, string> = {
  rfm: 'Перечень Росфинмониторинга',
  passport: 'Действительность паспорта МВД',
}

const RESULT_LABELS: Record<CheckResult, string> = {
  clear: 'Не найден',
  found: 'НАЙДЕН — выдача запрещена',
  error: 'Требует ручной проверки',
  manual_required: 'Требует ручной проверки',
}

function CheckIcon({ result }: { result: CheckResult }) {
  if (result === 'clear') return <span className="text-green-500 text-lg">✓</span>
  if (result === 'found') return <span className="text-red-500 text-lg">✗</span>
  return <span className="text-yellow-500 text-lg">!</span>
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ru-RU')
}

function formatDateOnly(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('ru-RU')
}

const RISK_LABELS = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }

export function ClientDetail({ client: initialClient, checks: initialChecks }: {
  client: Client
  checks: Check[]
}) {
  const router = useRouter()
  const [client, setClient] = useState(initialClient)
  const [checks, setChecks] = useState(initialChecks)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fio = [client.last_name, client.first_name, client.middle_name].filter(Boolean).join(' ')

  // Polling пока статус 'checking'
  const fetchLatest = useCallback(async () => {
    const { data: updatedClient } = await supabase
      .from('clients')
      .select('*')
      .eq('id', client.id)
      .single()

    if (updatedClient) {
      setClient(updatedClient)

      if (updatedClient.status !== 'checking') {
        const { data: updatedChecks } = await supabase
          .from('client_checks')
          .select('*')
          .eq('client_id', client.id)
          .order('checked_at', { ascending: false })
        setChecks(updatedChecks ?? [])
      }
    }
  }, [client.id, supabase])

  useEffect(() => {
    if (client.status !== 'checking') return
    const interval = setInterval(fetchLatest, 2000)
    return () => clearInterval(interval)
  }, [client.status, fetchLatest])

  // Запуск проверки
  const handleRunCheck = async () => {
    if (!client.birthday || !client.passport_series || !client.passport_number) {
      toast.error('Заполните дату рождения и паспортные данные перед проверкой')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          fio,
          birthday: client.birthday,
          passportSeries: client.passport_series,
          passportNumber: client.passport_number,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Ошибка при запуске проверки')
        return
      }

      setClient((prev) => ({ ...prev, status: 'checking' }))
      toast.info('Проверка запущена...')
    } catch {
      toast.error('Ошибка при запуске проверки')
    } finally {
      setLoading(false)
    }
  }

  // Пересмотр (rejected → draft)
  const handleReview = async () => {
    setLoading(true)
    try {
      await supabase
        .from('clients')
        .update({ status: 'draft', reject_reason: null })
        .eq('id', client.id)
      setClient((prev) => ({ ...prev, status: 'draft', reject_reason: null }))
      toast.success('Статус изменён на "Черновик"')
    } catch {
      toast.error('Ошибка при изменении статуса')
    } finally {
      setLoading(false)
    }
  }

  const hasErrors = checks.some((c) => c.result === 'error' || c.result === 'manual_required')

  return (
    <div className="max-w-4xl space-y-6">
      {/* Заголовок */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{fio}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <Badge
              variant={STATUS_VARIANTS[client.status]}
              className={client.status === 'approved' ? 'bg-green-500 hover:bg-green-600' : undefined}
            >
              {client.status === 'checking' && (
                <span className="mr-1 inline-block animate-spin">⟳</span>
              )}
              {STATUS_LABELS[client.status]}
            </Badge>
            <span>Создан: {formatDate(client.created_at)}</span>
            <span>Обновлён: {formatDate(client.updated_at)}</span>
          </div>
          {client.reject_reason && (
            <p className="mt-2 text-sm text-red-600">{client.reject_reason}</p>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-2">
          {client.status === 'draft' && (
            <Button onClick={handleRunCheck} disabled={loading}>
              Запустить проверку
            </Button>
          )}
          {client.status === 'approved' && (
            <Button onClick={() => router.push(`/api/pdf?clientId=${client.id}`)}>
              Скачать досье PDF
            </Button>
          )}
          {client.status === 'rejected' && (
            <Button variant="outline" onClick={handleReview} disabled={loading}>
              Пересмотреть
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push(`/dashboard/clients/${client.id}/edit`)}>
            Редактировать анкету
          </Button>
        </div>
      </div>

      <Separator />

      {/* Результаты проверок */}
      {checks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Результаты проверок</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasErrors && (
              <Alert className="border-yellow-400 bg-yellow-50">
                <AlertDescription className="flex items-center justify-between">
                  <span>Автоматическая проверка недоступна. Проверьте вручную на fedsfm.ru</span>
                  <a
                    href="https://fedsfm.ru/documents/terrorists-catalog-portal-act"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-sm underline whitespace-nowrap"
                  >
                    Перейти на сайт РФМ →
                  </a>
                </AlertDescription>
              </Alert>
            )}

            {checks.map((check) => (
              <div key={check.id} className="flex items-center gap-3 py-2">
                <CheckIcon result={check.result} />
                <div className="flex-1">
                  <span className="font-medium">{CHECK_LABELS[check.check_type]}</span>
                  <span
                    className={`ml-3 text-sm ${
                      check.result === 'clear'
                        ? 'text-green-600'
                        : check.result === 'found'
                        ? 'text-red-600 font-semibold'
                        : 'text-yellow-600'
                    }`}
                  >
                    {RESULT_LABELS[check.result]}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(check.checked_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Данные клиента */}
      <Card>
        <CardHeader>
          <CardTitle>Личные данные</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Фамилия" value={client.last_name} />
          <Field label="Имя" value={client.first_name} />
          <Field label="Отчество" value={client.middle_name} />
          <Field label="Дата рождения" value={formatDateOnly(client.birthday)} />
          <Field label="Гражданство" value={client.citizenship} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Паспортные данные</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Серия" value={client.passport_series} />
          <Field label="Номер" value={client.passport_number} />
          <Field label="Кем выдан" value={client.passport_issued_by} />
          <Field label="Дата выдачи" value={formatDateOnly(client.passport_issued_date)} />
          <Field label="Код подразделения" value={client.passport_division_code} />
          <Field label="Адрес регистрации" value={client.reg_address} />
          <Field label="Адрес проживания" value={client.live_address ?? client.reg_address} />
          <Field label="СНИЛС" value={client.snils} />
          <Field label="ИНН" value={client.inn} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Оценка риска</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <Field label="Цель займа" value={client.loan_purpose} />
          <Field label="Источник дохода" value={client.income_source} />
          <Field label="ПЭП" value={client.is_pep ? 'Да' : 'Нет'} />
          {client.pep_description && (
            <Field label="Описание ПЭП" value={client.pep_description} />
          )}
          <Field label="Группа риска" value={RISK_LABELS[client.risk_level]} />
          {client.risk_reason && (
            <Field label="Обоснование риска" value={client.risk_reason} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}
