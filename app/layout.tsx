import './globals.css';
import type { Metadata } from 'next';
import { Inter, Playfair_Display, Dancing_Script, Kalam } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from "@/components/providers/AuthProvider";
import { StickyNotesProvider } from "@/components/StickyNotes/StickyNotesProvider";

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-serif',
});

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  variable: '--font-handwriting',
});

const kalam = Kalam({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-kalam',
});

export const metadata: Metadata = {
  title: 'Our Beautiful Journey',
  description: 'A digital collection of our treasured memories and shared adventures',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} ${dancingScript.variable} ${kalam.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <StickyNotesProvider>
              <div style={{ minHeight: '100vh', padding: '20px' }}>
                <p style={{ marginBottom: '20px', color: '#666' }}>Layout with Auth + StickyNotes loaded successfully</p>
                {children}
              </div>
              <Toaster />
            </StickyNotesProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}