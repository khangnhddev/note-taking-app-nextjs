'use client';

import './globals.css'
import './styles/auth.css'
import './styles/notes.css'
import { ViewModeProvider } from './contexts/ViewModeContext'
import { Providers } from "./providers";
import { StrictMode } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <StrictMode>
          <Providers>
            <ViewModeProvider>
              {children}
            </ViewModeProvider>
          </Providers>
        </StrictMode>
      </body>
    </html>
  )
} 