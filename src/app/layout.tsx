import type { Metadata } from "next";
import { Inter, Space_Grotesk, Noto_Serif_JP } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/components/web-vitals";
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

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  display: "optional",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ManeExchange — The Standard for Equine Transactions",
    template: "%s | ManeExchange",
  },
  description:
    "The institutional standard for buying and selling horses. Verified documentation, secured escrow, and transparent seller scoring.",
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
    <html lang="en" className="vt-enabled" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        <link rel="preconnect" href="https://assets.mixkit.co" />
        <link rel="dns-prefetch" href="https://assets.mixkit.co" />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${notoSerifJP.variable} antialiased`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegister />
        <WebVitals />
      </body>
    </html>
  );
}
