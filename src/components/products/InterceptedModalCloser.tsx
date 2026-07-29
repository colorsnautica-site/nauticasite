"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { useCart } from "@/components/cart/CartContext";

export function InterceptedModalCloser({
  children,
  labelledBy
}: {
  children: React.ReactNode;
  labelledBy?: string;
}) {
  const router = useRouter();
  const { setProductModalCloser } = useCart();

  // Registra no carrinho como fechar este modal de produto, pra o botão
  // "Continuar comprando" conseguir fechar os dois de uma vez.
  useEffect(() => {
    setProductModalCloser(() => router.back());
    return () => setProductModalCloser(null);
  }, [router, setProductModalCloser]);

  return (
    <Modal onClose={() => router.back()} labelledBy={labelledBy}>
      {children}
    </Modal>
  );
}
