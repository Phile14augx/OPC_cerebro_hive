import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CerebroChat from "@/components/layout/CerebroChat";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MotionProvider } from "@/components/motion/foundation/MotionProvider";

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
  title: {
    default: "CerebroHive — Intelligence. Connection. Impact.",
    template: "%s | CerebroHive",
  },
  description:
    "CerebroHive helps organizations automate workflows, deploy AI solutions, and build AI-ready teams. AI Consulting, AI Automation, and AI Education.",
  keywords: ["AI consulting", "AI automation", "AI education", "AI agents", "machine learning", "digital transformation"],
  authors: [{ name: "CerebroHive" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cerebro-hive.com",
    siteName: "CerebroHive",
    title: "CerebroHive — Intelligence. Connection. Impact.",
    description:
      "CerebroHive helps organizations automate workflows, deploy AI solutions, and build AI-ready teams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CerebroHive — Intelligence. Connection. Impact.",
    description: "AI Consulting, Automation & Education Platform.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased selection:bg-primary-accent selection:text-text-primary transition-colors duration-500" suppressHydrationWarning>
        <MotionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            <LanguageProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
              <CerebroChat />
            </LanguageProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
