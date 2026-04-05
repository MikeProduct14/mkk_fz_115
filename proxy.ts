import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Простой in-memory кэш для dev режима
const sessionCache = new Map<string, { user: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5 секунд

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Получаем токен для кэширования
  const token = request.cookies.get('sb-access-token')?.value || 
                request.cookies.get('sb-uenvuhwboxplwcokslwk-auth-token')?.value

  let user = null

  // Проверяем кэш
  if (token) {
    const cached = sessionCache.get(token)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      user = cached.user
    }
  }

  // Если нет в кэше - запрашиваем
  if (!user && token) {
    const { data } = await supabase.auth.getUser()
    user = data.user
    
    // Сохраняем в кэш
    if (user && token) {
      sessionCache.set(token, { user, timestamp: Date.now() })
      
      // Очищаем старые записи
      if (sessionCache.size > 100) {
        const entries = Array.from(sessionCache.entries())
        entries.slice(0, 50).forEach(([key]) => sessionCache.delete(key))
      }
    }
  }

  // Защита dashboard роутов
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Редирект на dashboard если уже залогинен
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
