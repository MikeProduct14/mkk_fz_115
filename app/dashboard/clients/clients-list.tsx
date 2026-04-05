import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function ClientsList({ orgId }: { orgId: string }) {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (!clients || clients.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <p className="text-muted-foreground mb-4">Клиенты ещё не добавлены</p>
        <Link href="/dashboard/clients/new">
          <Button>Добавить первого клиента</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="p-4 text-left font-medium">ФИО</th>
            <th className="p-4 text-left font-medium">Паспорт</th>
            <th className="p-4 text-left font-medium">Риск</th>
            <th className="p-4 text-left font-medium">Статус</th>
            <th className="p-4 text-left font-medium">Дата</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b last:border-0">
              <td className="p-4">
                {client.last_name} {client.first_name} {client.middle_name}
              </td>
              <td className="p-4">
                {client.passport_series} {client.passport_number}
              </td>
              <td className="p-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    client.risk_level === 'low'
                      ? 'bg-green-100 text-green-800'
                      : client.risk_level === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {client.risk_level === 'low'
                    ? 'Низкий'
                    : client.risk_level === 'medium'
                    ? 'Средний'
                    : 'Высокий'}
                </span>
              </td>
              <td className="p-4">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    client.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : client.status === 'checking'
                      ? 'bg-yellow-100 text-yellow-800'
                      : client.status === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {client.status === 'approved'
                    ? 'Одобрен'
                    : client.status === 'checking'
                    ? 'Проверка'
                    : client.status === 'rejected'
                    ? 'Отклонён'
                    : 'Черновик'}
                </span>
              </td>
              <td className="p-4 text-sm text-muted-foreground">
                {new Date(client.created_at).toLocaleDateString('ru-RU')}
              </td>
              <td className="p-4">
                <Link href={`/dashboard/clients/${client.id}`}>
                  <Button variant="ghost" size="sm">Открыть</Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ClientsListSkeleton() {
  return (
    <div className="rounded-lg border animate-pulse">
      <div className="border-b bg-muted/50 p-4">
        <div className="flex gap-4">
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-5 w-24 bg-muted rounded"></div>
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="border-b last:border-0 p-4">
          <div className="flex gap-4">
            <div className="h-5 w-48 bg-muted rounded"></div>
            <div className="h-5 w-32 bg-muted rounded"></div>
            <div className="h-5 w-20 bg-muted rounded"></div>
            <div className="h-5 w-24 bg-muted rounded"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
