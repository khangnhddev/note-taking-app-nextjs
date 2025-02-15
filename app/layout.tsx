import './globals.css'
import './styles/auth.css'
import './styles/notes.css'
import { ViewModeProvider } from './contexts/ViewModeContext'
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ViewModeProvider>
            {children}
          </ViewModeProvider>
        </Providers>
      </body>
    </html>
  )
} 