import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "sonner";
import { Providers } from "./providers";
import FooterWrapper from "@/components/footer-wrapper";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ZeroSphere",
  description: "Simplifying Financial Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-sm.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
