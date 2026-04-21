import { Font } from '@react-pdf/renderer'
import path from 'path'

let registered = false

export function registerFonts() {
  if (registered) return
  registered = true

  // On Vercel serverless, public/ files are not accessible via filesystem.
  // Use absolute file paths in production (files are bundled) or fall back to
  // process.cwd() locally. Both resolve to the same TTF files.
  const isVercel = process.env.VERCEL === '1'

  const fontSrc = (name: string) =>
    isVercel
      ? `https://${process.env.VERCEL_URL}/fonts/${name}`
      : path.join(process.cwd(), 'public', 'fonts', name)

  Font.register({
    family: 'Roboto',
    fonts: [
      { src: fontSrc('Roboto-Light.ttf'), fontWeight: 300 },
      { src: fontSrc('Roboto-Regular.ttf'), fontWeight: 400 },
      { src: fontSrc('Roboto-Medium.ttf'), fontWeight: 500 },
      { src: fontSrc('Roboto-Bold.ttf'), fontWeight: 700 },
    ],
  })
}
