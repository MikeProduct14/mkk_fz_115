'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Главная' },
  { href: '/dashboard/clients', label: 'Клиенты' },
  { href: '/dashboard/pvk', label: 'ПВК' },
  { href: '/dashboard/settings', label: 'Настройки' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className="block"
            prefetch={true}
          >
            <Button 
              variant={isActive ? "secondary" : "ghost"} 
              className="w-full justify-start"
            >
              {item.label}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
