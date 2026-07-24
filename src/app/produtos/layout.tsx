import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { WhatsappIcon } from "@/components/WhatsappIcon";
import { buildSupportMessage, resolveWhatsappNumber, whatsappUrl } from "@/lib/whatsapp";
import { getSiteContent } from "@/db/queries/content";

export default async function ProdutosLayout({ children }: { children: ReactNode }) {
  const supportUrl = whatsappUrl(buildSupportMessage(), resolveWhatsappNumber());
  const content = await getSiteContent();
  const location = content.location || "Marina Verolme, Angra dos Reis - RJ";

  return (
    <>
      <Header supportUrl={supportUrl} />
      <main>{children}</main>

      <footer className="bg-navy py-8 text-center text-xs text-white/60">
        <p>© Náutica Color · {location}</p>
      </footer>

      <a
        href={supportUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar com a Náutica Color pelo WhatsApp"
        className="fixed bottom-4 right-4 z-30 grid h-14 w-14 place-items-center text-red drop-shadow-lg transition hover:scale-110 hover:text-red-bright sm:bottom-6"
      >
        <WhatsappIcon className="h-14 w-14" backdrop />
      </a>
    </>
  );
}
