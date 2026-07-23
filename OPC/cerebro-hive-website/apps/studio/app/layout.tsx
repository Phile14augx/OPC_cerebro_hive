import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Providers } from "./providers";
import { StudioShell } from "@/components/layout/StudioShell";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CerebroStudio",
  description: "Enterprise AI Engineering Environment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased selection:bg-primary-accent selection:text-text-primary overflow-hidden" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <Providers>
            <StudioShell>
              {children}
            </StudioShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
