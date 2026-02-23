import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ManeExchange — The Equestrian Marketplace",
    template: "%s | ManeExchange",
  },
  description:
    "The trusted marketplace for buying and selling show horses. Verified listings, escrowed payments, and transparent seller scoring.",
  metadataBase: new URL("https://maneexchange.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ManeExchange",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ManeExchange",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased`}
      >
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
