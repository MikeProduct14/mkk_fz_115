import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export async function DashboardStats({ orgId }: { orgId: string }) {
  const supabase = await createClient()
  
  const { data: clients } = await supabase
    .from('clients')
    .select('status')
    .eq('org_id', orgId)

  const stats = {
    total: clients?.length || 0,
    approved: clients?.filter(c => c.status === 'approved').length || 0,
    checking: clients?.filter(c => c.status === 'checking').length || 0,
    rejected: clients?.filter(c => c.status === 'rejected').length || 0,
  }

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <div className="rounded-lg border p-6">
        <div className="text-2xl font-bold">{stats.total}</div>
        <p className="text-sm text-muted-foreground">Всего клиентов</p>
      </div>
      <div className="rounded-lg border p-6">
        <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
        <p className="text-sm text-muted-foreground">Одобрено</p>
      </div>
      <div className="rounded-lg border p-6">
        <div className="text-2xl font-bold text-yellow-600">{stats.checking}</div>
        <p className="text-sm text-muted-foreground">На проверке</p>
      </div>
      <div className="rounded-lg border p-6">
        <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
        <p className="text-sm text-muted-foreground">Отклонено</p>
      </div>
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border p-6">
          <div className="h-8 w-16 bg-muted rounded mb-2"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  )
}

export async function ComplianceStatus({ organization }: { organization: any }) {
  const pvkOutdated = organization?.pvk_updated_at
    ? new Date(organization.pvk_updated_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : true

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-4">Статус Compliance</h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Профиль МФО</span>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              organization ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {organization ? 'Заполнен' : 'Не заполнен'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Правила внутреннего контроля (ПВК)</span>
          <span
            className={`rounded-full px-3 py-1 text-sm ${
              pvkOutdated ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {pvkOutdated ? 'Требует обновления' : 'Актуально'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function QuickActions({ organization }: { organization: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Быстрые действия</h2>
      <div className="flex gap-4">
        {!organization && (
          <Link href="/dashboard/settings">
            <Button>Настроить профиль МФО</Button>
          </Link>
        )}
        <Link href="/dashboard/clients/new">
          <Button variant="outline">Добавить клиента</Button>
        </Link>
        <Link href="/dashboard/pvk">
          <Button variant="outline">Скачать ПВК</Button>
        </Link>
      </div>
    </div>
  )
}
