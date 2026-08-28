import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Providers } from "./providers";
import { SiteChrome } from "@/components/layout/SiteChrome";

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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-text-primary antialiased selection:bg-primary-accent selection:text-text-primary" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <Providers>
            <SiteChrome>
              {children}
            </SiteChrome>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
