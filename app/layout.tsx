import './globals.css'
import './styles/auth.css'
import './styles/notes.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Note Taking App</title>
        <meta name="description" content="A simple note-taking application" />
      </head>
      <body>{children}</body>
    </html>
  );
} 