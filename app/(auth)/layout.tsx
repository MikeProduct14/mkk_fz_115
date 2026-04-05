export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">КомплаенсМФО</h1>
          <p className="text-muted-foreground">
            Автоматизация compliance по ФЗ-115
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
