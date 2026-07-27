import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: {
    default: "CerebroHive — Enterprise AI Systems",
    template: "%s | CerebroHive",
  },
  description:
    "CerebroHive architects enterprise AI systems — AI Strategy, Platform Engineering, AI Agents, RAG, Knowledge Engineering, AI Governance, and AI Education. Serving 16+ industries worldwide.",
  keywords: [
    "enterprise AI",
    "AI transformation",
    "AI consulting",
    "AI agents",
    "RAG",
    "MLOps",
    "AI governance",
    "knowledge engineering",
    "AI platform",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CerebroHive",
  },
  robots: { index: true, follow: true },
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cerebro-hive.com";

// Organization structured data — read by search and answer engines (Google
// Knowledge Panel, AI Overviews, ChatGPT/Perplexity-style answer engines) to
// establish CerebroHive as a real, citable entity independent of any single
// page's copy.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CerebroHive",
  url: SITE_URL,
  description:
    "CerebroHive architects enterprise AI systems — AI Strategy, Platform Engineering, AI Agents, RAG, Knowledge Engineering, and AI Governance — serving 16+ industries worldwide.",
  sameAs: [] as string[],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-text-primary antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            {children}
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
