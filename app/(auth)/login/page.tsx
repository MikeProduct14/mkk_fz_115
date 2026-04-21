'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '../actions'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? ''
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? ''

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setLoading(true)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleDemo() {
    if (!DEMO_EMAIL || !DEMO_PASSWORD) return
    setError(null)
    setDemoLoading(true)

    const formData = new FormData()
    formData.append('email', DEMO_EMAIL)
    formData.append('password', DEMO_PASSWORD)
    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setDemoLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Вход в систему</CardTitle>
        <CardDescription>
          Введите email и пароль для входа
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
              disabled={loading || demoLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={loading || demoLoading}
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading || demoLoading}>
            {loading ? 'Вход...' : 'Войти'}
          </Button>
          {DEMO_EMAIL && DEMO_PASSWORD && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading || demoLoading}
              onClick={handleDemo}
            >
              {demoLoading ? 'Вход...' : 'Войти как демо'}
            </Button>
          )}
          <p className="text-sm text-center text-muted-foreground">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
