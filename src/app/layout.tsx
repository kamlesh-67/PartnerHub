import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { NextAuthProvider } from "@/components/providers/nextauth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B2B Commerce Platform",
  description: "Modern B2B commerce solution with role-based access control",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="hydrated">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <ReduxProvider>
            <NextAuthProvider>
              <MainLayout>{children}</MainLayout>
            </NextAuthProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
