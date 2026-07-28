import { getSiteContent } from "@/db/queries/content";
import { ContentForm } from "@/app/admin/(painel)/_components/ContentForm";

export const dynamic = "force-dynamic";

export default async function AdminConteudo() {
  return <ContentForm content={await getSiteContent()} />;
}
