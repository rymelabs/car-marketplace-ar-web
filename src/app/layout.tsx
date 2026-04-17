import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { BottomNav } from "@/components/bottom-nav";
import "./globals.css";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Space_Grotesk({
  variable: "--font-heading" ,
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpawnDrive",
  description:
    "SpawnDrive car marketplace with true-scale AR previews before purchase decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable} h-full`}>
      <body suppressHydrationWarning className="min-h-full pb-24 font-body text-slate-900 antialiased">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
