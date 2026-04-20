import { Font } from '@react-pdf/renderer'
import path from 'path'

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  const fontsDir = path.join(process.cwd(), 'public', 'fonts')

  Font.register({
    family: 'Roboto',
    fonts: [
      { src: path.join(fontsDir, 'Roboto-Light.ttf'), fontWeight: 300 },
      { src: path.join(fontsDir, 'Roboto-Regular.ttf'), fontWeight: 400 },
      { src: path.join(fontsDir, 'Roboto-Medium.ttf'), fontWeight: 500 },
      { src: path.join(fontsDir, 'Roboto-Bold.ttf'), fontWeight: 700 },
    ],
  })
}
