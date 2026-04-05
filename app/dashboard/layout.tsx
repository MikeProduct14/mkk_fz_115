import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { DashboardNav } from '@/components/dashboard-nav'
import { signOut } from '@/app/(auth)/actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth guard - если не авторизован, редирект на login
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/40 p-6">
        <div className="mb-8">
          <h2 className="text-xl font-bold">Compliance MFO</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <DashboardNav />
        </nav>

        <div className="mt-auto pt-8">
          <form action={signOut}>
            <Button variant="outline" className="w-full" type="submit">
              Выйти
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
