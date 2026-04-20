'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function PVKPage() {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pvk-pdf')

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Ошибка при генерации ПВК')
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'PVK.pdf'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('ПВК успешно сформированы')
    } catch {
      toast.error('Ошибка при генерации ПВК')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Правила внутреннего контроля</h1>
        <p className="text-muted-foreground mt-1">
          Скачайте ПВК, сформированные на основе данных вашей организации
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ПВК в целях ПОД/ФТ</CardTitle>
          <CardDescription>
            Документ сформируется автоматически на основе профиля организации,
            данных СДЛ и даты последнего обновления.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-muted p-4 text-sm space-y-1">
            <p className="font-medium">Документ включает:</p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
              <li>Общие положения и ссылки на ФЗ-115</li>
              <li>Программу идентификации клиентов</li>
              <li>Программу оценки риска (таблица критериев)</li>
              <li>Программу выявления операций обязательного контроля</li>
              <li>Программу хранения документов</li>
              <li>Программу подготовки кадров</li>
              <li>Блок подписей руководителя и СДЛ</li>
            </ul>
          </div>

          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            <p className="font-medium mb-1">Перед скачиванием убедитесь:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>В настройках заполнены ИНН, название и тип организации</li>
              <li>Указаны ФИО и должность СДЛ</li>
              <li>Установлена дата последнего обновления ПВК</li>
            </ul>
          </div>

          <Button onClick={handleDownload} disabled={loading} size="lg">
            {loading ? 'Формирование PDF...' : 'Скачать ПВК (PDF)'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Важно</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Сгенерированный документ является типовой формой ПВК. После скачивания
            рекомендуется проверить документ на соответствие актуальным требованиям
            Банка России и Росфинмониторинга.
          </p>
          <p>
            ПВК должны обновляться не реже одного раза в год. Обновлённая дата
            фиксируется в настройках организации.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
