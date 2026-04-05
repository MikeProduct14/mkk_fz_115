import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { ClientsList, ClientsListSkeleton } from './clients-list'

// Отключаем кэширование для актуальных данных
export const revalidate = 0

async function getOrganization() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: organization } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user?.id)
    .single()

  return organization
}

export default async function ClientsPage() {
  const organization = await getOrganization()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Клиенты</h1>
        <Link href="/dashboard/clients/new">
          <Button>Добавить клиента</Button>
        </Link>
      </div>

      {organization ? (
        <Suspense fallback={<ClientsListSkeleton />}>
          <ClientsList orgId={organization.id} />
        </Suspense>
      ) : (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Сначала настройте профиль организации
          </p>
          <Link href="/dashboard/settings">
            <Button>Перейти к настройкам</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
