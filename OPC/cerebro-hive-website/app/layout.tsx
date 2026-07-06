import type { Metadata } from "next";
import { Orbitron, Exo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CerebroChat from "@/components/layout/CerebroChat";
import { LanguageProvider } from "@/components/layout/LanguageContext";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
});

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
    <html lang="en" className={`${orbitron.variable} ${exo2.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <Navbar />
          <main style={{ paddingTop: "72px" }}>{children}</main>
          <Footer />
          <CerebroChat />
        </LanguageProvider>
      </body>
    </html>
  );
}
