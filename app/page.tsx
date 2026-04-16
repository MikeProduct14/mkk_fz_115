import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Compliance MFO
        </h1>
        <p className="text-xl text-muted-foreground">
          Автоматизация compliance по ФЗ-115 для микрофинансовых организаций
        </p>
        <p className="text-lg text-muted-foreground">
          Если завтра придёт проверка ЦБ — всё готово
        </p>
        <div className="flex gap-4 mt-4">
          <Link href="/register">
            <Button size="lg">Начать работу</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">Войти</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
