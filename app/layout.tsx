import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://funko-money.com'),
  title: {
    default: "FinkoMoney - Controle Financeiro Pessoal Inteligente",
    template: "%s | FinkoMoney"
  },
  description: "Gerencie suas finanças pessoais de forma simples e eficiente. Controle despesas, receitas, metas financeiras e orçamentos em um único lugar. Planejamento financeiro inteligente para você e sua família.",
  keywords: [
    "controle financeiro",
    "finanças pessoais",
    "gestão financeira",
    "orçamento pessoal",
    "planejamento financeiro",
    "despesas",
    "receitas",
    "metas financeiras",
    "economia doméstica",
    "controle de gastos",
    "aplicativo financeiro",
    "gerenciador financeiro"
  ],
  authors: [{ name: "FinkoMoney" }],
  creator: "FinkoMoney",
  publisher: "FinkoMoney",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://funko-money.com",
    title: "FinkoMoney - Controle Financeiro Pessoal Inteligente",
    description: "Gerencie suas finanças pessoais de forma simples e eficiente. Controle despesas, receitas, metas financeiras e orçamentos em um único lugar.",
    siteName: "FinkoMoney",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FinkoMoney - Controle Financeiro Pessoal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FinkoMoney - Controle Financeiro Pessoal Inteligente",
    description: "Gerencie suas finanças pessoais de forma simples e eficiente. Controle despesas, receitas, metas e orçamentos.",
    images: ["/og-image.png"],
    creator: "@finkomoney",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/finkomoney-logo.svg",
    shortcut: "/finkomoney-logo.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  verification: {
    google: "seu-codigo-google-search-console",
    // yandex: "seu-codigo-yandex",
    // bing: "seu-codigo-bing",
  },
  alternates: {
    canonical: "https://funko-money.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
