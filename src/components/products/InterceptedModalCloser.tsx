"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

export function InterceptedModalCloser({
  children,
  labelledBy
}: {
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const router = useRouter();
  return (
    <Modal onClose={() => router.back()} labelledBy={labelledBy}>
      {children}
    </Modal>
  );
}
