import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-montserrat" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "CIDR Calculator",
  description: "A beautiful and interactive CIDR Calculator built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${jetbrainsMono.variable} bg-slate-50 min-h-screen`}>
        <nav className="w-full bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 py-3 sticky top-0 z-20">
          <span className="text-xl font-bold font-montserrat tracking-tight text-blue-700">CIDR Calculator</span>
          <a
            href="https://github.com/muhammadarslan/cidr" // TODO: Replace with your actual repo URL
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-600 hover:text-blue-700 font-montserrat text-base"
            title="View on GitHub"
          >
            <svg height="22" width="22" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </nav>
        {children}
        <footer className="w-full bg-white border-t border-slate-200 text-slate-500 text-center py-4 mt-10 text-sm font-montserrat">
          © {new Date().getFullYear()} CIDR Calculator &middot; Created by <a href="https://jhear.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">Muhammad Arslan</a>
        </footer>
      </body>
    </html>
  );
}
