import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { CommandPalette } from "@/components/CommandPalette";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import "./globals.css";

const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Cerebro Nexarch OS",
  description: "Personal operator command center for Cerebro Nexarch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="mono" className={mono.variable}>
      <body className={`${mono.className} min-h-screen bg-os-bg text-os-text antialiased`}>
        <Sidebar />
        <div className="ml-56 min-h-screen">
          <Topbar />
          <main className="px-8 py-8">{children}</main>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
