import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'G Ativos — Ativos para Google Ads',
  description: 'Ativos criados um por um. Contas Google Ads verificadas, aquecidas e testadas. Entrega imediata no chat do pedido.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
