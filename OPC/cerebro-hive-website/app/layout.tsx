import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CerebroChat from "@/components/layout/CerebroChat";
import { LanguageProvider } from "@/components/layout/LanguageContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { MotionProvider } from "@/components/motion/foundation/MotionProvider";
import { JsonLd } from "@/components/discovery";
import { buildOrganizationSchema, buildWebsiteSchema } from "@/lib/discovery";
import { MarketingWrapper } from "@/components/layout/MarketingWrapper";

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
  metadataBase: new URL("https://cerebropchive.org"),
  title: {
    default: "CerebroHive — Intelligence. Connection. Impact.",
    template: "%s | CerebroHive",
  },
  description:
    "CerebroHive architects enterprise AI systems — AI Strategy, Platform Engineering, Autonomous Transformation, Knowledge Engineering, AI Governance, and AI Education. Serving 16+ industries worldwide.",
  keywords: ["enterprise AI", "AI consulting", "AI agents", "RAG", "LLM", "MLOps", "AI governance", "AI transformation", "knowledge engineering", "HivePulse", "Cerebro X"],
  authors: [{ name: "CerebroHive", url: "https://cerebropchive.org" }],
  creator: "CerebroHive",
  publisher: "CerebroHive",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cerebropchive.org",
    siteName: "CerebroHive",
    title: "CerebroHive — Intelligence. Connection. Impact.",
    description:
      "Enterprise AI systems that transform how organizations operate, learn, and grow.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CerebroHive — Intelligence. Connection. Impact.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cerebropchive",
    title: "CerebroHive — Intelligence. Connection. Impact.",
    description: "Enterprise AI Strategy, Platform Engineering & Education.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://cerebropchive.org" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased selection:bg-primary-accent selection:text-text-primary transition-colors duration-500" suppressHydrationWarning>
        <JsonLd schema={buildOrganizationSchema()} />
        <JsonLd schema={buildWebsiteSchema()} />
        <MotionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            disableTransitionOnChange={false}
          >
            <LanguageProvider>
              <MarketingWrapper>
                <Navbar />
              </MarketingWrapper>
              <main>{children}</main>
              <MarketingWrapper>
                <Footer />
                <CerebroChat />
              </MarketingWrapper>
            </LanguageProvider>
          </ThemeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
