import './globals.css'
import './styles/auth.css'
import './styles/notes.css'
import { ViewModeProvider } from './contexts/ViewModeContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ViewModeProvider>
          {children}
        </ViewModeProvider>
      </body>
    </html>
  )
} 