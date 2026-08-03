import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const siteUrl = "https://visionmanager.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Vision Manager | Sistema para Óticas",
    template: "%s | Vision Manager",
  },

  description:
    "Plataforma de gestão para óticas com envelopes digitais, clientes, ordens de serviço, receitas, garantias e relatórios.",

  applicationName: "Vision Manager",

  keywords: [
    "sistema para ótica",
    "software para ótica",
    "gestão de ótica",
    "envelope digital para ótica",
    "ordem de serviço ótica",
    "receita ótica",
    "garantia ótica",
    "cadastro de clientes ótica",
    "Vision Manager",
  ],

  authors: [{ name: "Vision Manager", url: siteUrl }],
  creator: "Vision Manager",
  publisher: "Vision Manager",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Vision Manager",
    title: "Vision Manager | Sistema para Óticas",
    description:
      "Organize clientes, ordens de serviço, receitas e envelopes digitais da sua ótica em uma única plataforma.",
    images: [
      {
        url: "/og/vision-manager-og.png",
        width: 1200,
        height: 630,
        alt: "Vision Manager - sistema para gestão de óticas",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Vision Manager | Sistema para Óticas",
    description:
      "Gestão de clientes, ordens de serviço, envelopes digitais e relatórios para óticas.",
    images: ["/og/vision-manager-og.png"],
  },

  icons: {
    icon: [
      { url: "/icons/favicon.ico" },
      {
        url: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/icons/favicon.ico"],
  },

  appleWebApp: {
    capable: true,
    title: "Vision Manager",
    statusBarStyle: "default",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "technology",
};

export const viewport = {
  themeColor: "#6f58cc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>

        <div id="portal-root" />
      </body>
    </html>
  );
}