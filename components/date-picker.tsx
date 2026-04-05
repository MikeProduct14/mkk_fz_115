'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
}

export function DatePicker({ value, onChange, placeholder = 'Выберите дату' }: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)

  // Синхронизация value с inputValue
  React.useEffect(() => {
    if (value) {
      setInputValue(format(value, 'dd.MM.yyyy', { locale: ru }))
    } else {
      setInputValue('')
    }
  }, [value])

  // Обработка ручного ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/[^\d]/g, '')
    
    // Автоматически добавляем точки
    if (input.length >= 2) {
      input = input.slice(0, 2) + '.' + input.slice(2)
    }
    if (input.length >= 5) {
      input = input.slice(0, 5) + '.' + input.slice(5)
    }
    if (input.length > 10) {
      input = input.slice(0, 10)
    }
    
    setInputValue(input)

    // Парсим дату когда введено 10 символов
    if (input.length === 10) {
      const parts = input.split('.')
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      
      const date = new Date(year, month, day)
      
      // Проверяем валидность
      if (
        !isNaN(date.getTime()) &&
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      ) {
        onChange(date)
      }
    }
  }

  // Обработка потери фокуса
  const handleInputBlur = () => {
    if (inputValue.length === 10) {
      const parts = inputValue.split('.')
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const year = parseInt(parts[2], 10)
      
      const date = new Date(year, month, day)
      
      if (
        !isNaN(date.getTime()) &&
        date.getDate() === day &&
        date.getMonth() === month &&
        date.getFullYear() === year
      ) {
        onChange(date)
      } else {
        // Невалидная дата - восстанавливаем или очищаем
        setInputValue(value ? format(value, 'dd.MM.yyyy', { locale: ru }) : '')
      }
    } else if (inputValue.length > 0 && inputValue.length < 10) {
      // Неполная дата - восстанавливаем или очищаем
      setInputValue(value ? format(value, 'dd.MM.yyyy', { locale: ru }) : '')
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder="дд.мм.гггг"
        maxLength={10}
        className="flex-1"
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          type="button"
          className={cn(
            'inline-flex items-center justify-center rounded-md border border-input bg-background px-3 h-10 w-10 hover:bg-accent hover:text-accent-foreground',
            !value && 'text-muted-foreground'
          )}
        >
          📅
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setIsOpen(false)
            }}
            locale={ru}
            captionLayout="dropdown"
            fromYear={1900}
            toYear={new Date().getFullYear()}
            defaultMonth={value || new Date(1990, 0, 1)}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
