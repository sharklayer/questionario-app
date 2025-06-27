'use client'

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <SessionProvider>
          <div className="text-blue-500">Teste de Estilo Tailwind</div>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}