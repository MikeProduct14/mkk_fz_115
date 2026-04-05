import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientDetail } from './client-detail'

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Загружаем клиента с проверками
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) notFound()

  // Проверяем что клиент принадлежит организации пользователя
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!org || client.org_id !== org.id) redirect('/dashboard/clients')

  const { data: checks } = await supabase
    .from('client_checks')
    .select('*')
    .eq('client_id', id)
    .order('checked_at', { ascending: false })

  return <ClientDetail client={client} checks={checks ?? []} />
}
