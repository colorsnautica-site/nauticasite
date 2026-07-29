import type { Metadata } from "next";
import { Fraunces, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { CartButton } from "@/components/cart/CartButton";
import { CartProvider } from "@/components/cart/CartContext";
import { getSiteContent } from "@/db/queries/content";
import { resolveWhatsappNumber } from "@/lib/whatsapp";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", weight: ["400", "500", "600", "700"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });

export const metadata: Metadata = {
  title: "Náutica Color | Produtos para a sua embarcação",
  description:
    "Tintas, antifouling, acabamentos e abrasivos de alta performance. Fale com o atendimento pelo WhatsApp e encontre o produto certo para a sua embarcação.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: "/favicon.png"
  }
};

export default async function RootLayout({
  children,
  modal
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const content = await getSiteContent();
  const whatsappNumber = resolveWhatsappNumber(content.whatsapp_1);

  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable} ${fraunces.variable}`}>
      <body className="antialiased">
        <CartProvider whatsappNumber={whatsappNumber}>
          {children}
          {modal}
          <CartButton />
        </CartProvider>
      </body>
    </html>
  );
}
