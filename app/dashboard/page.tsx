import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { 
  DashboardStats, 
  DashboardStatsSkeleton,
  ComplianceStatus,
  QuickActions 
} from './page-content'

// Отключаем кэширование для актуальных данных
export const revalidate = 0

async function getOrganization() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user?.id)
    .single()

  return organization
}

export default async function DashboardPage() {
  const organization = await getOrganization()

  // Если нет организации - редирект на настройки
  if (!organization) {
    redirect('/dashboard/settings')
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Дашборд</h1>
        <p className="text-muted-foreground">
          {organization.name}
        </p>
      </div>

      {/* Статус compliance - загружается сразу */}
      <ComplianceStatus organization={organization} />

      {/* Статистика клиентов - загружается с Suspense */}
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats orgId={organization.id} />
      </Suspense>

      {/* Быстрые действия */}
      <QuickActions organization={organization} />
    </div>
  )
}
