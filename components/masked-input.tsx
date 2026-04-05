'use client'

import * as React from 'react'
import { Input } from '@/components/ui/input'

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: string // Маска: 9 = цифра, любой другой символ = литерал
  value?: string
  onChange?: (value: string) => void
  returnMasked?: boolean // Возвращать значение с маской или только цифры
}

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = '', onChange, returnMasked = false, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

    React.useEffect(() => {
      setDisplayValue(applyMask(value, mask))
    }, [value, mask])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value
      const cleaned = input.replace(/\D/g, '') // Только цифры
      const masked = applyMask(cleaned, mask)
      
      setDisplayValue(masked)
      
      // Возвращаем либо с маской, либо только цифры
      onChange?.(returnMasked ? masked : cleaned)
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
      />
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

// Применяет маску к значению
function applyMask(value: string, mask: string): string {
  if (!value) return ''
  
  let result = ''
  let valueIndex = 0

  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    if (mask[i] === '9') {
      // Цифра из значения
      result += value[valueIndex]
      valueIndex++
    } else {
      // Литерал из маски (дефис, пробел и т.д.)
      result += mask[i]
    }
  }

  return result
}

