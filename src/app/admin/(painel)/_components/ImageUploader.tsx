"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function ImageUploader({ current, name = "imagem" }: { current?: string; name?: string }) {
  const [preview, setPreview] = useState<string | undefined>(current);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedName, setSelectedName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const revokeObjectUrl = useCallback(() => {
    if (!objectUrlRef.current) return;
    URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
  }, []);

  const restoreCurrentPreview = useCallback(() => {
    revokeObjectUrl();
    setPreview(current);
    setPreviewLoading(Boolean(current));
    setSelectedName("");
    setError("");
  }, [current, revokeObjectUrl]);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;

    const handleReset = () => restoreCurrentPreview();
    form.addEventListener("reset", handleReset);
    return () => form.removeEventListener("reset", handleReset);
  }, [restoreCurrentPreview]);

  useEffect(() => () => revokeObjectUrl(), [revokeObjectUrl]);

  useEffect(() => {
    if (objectUrlRef.current) return;
    setPreview(current);
    setPreviewLoading(Boolean(current));
  }, [current]);

  useEffect(() => {
    if (!preview || !previewLoading) return;
    const timer = window.setTimeout(() => {
      setPreviewLoading(false);
      setError("A prévia demorou demais. Escolha outra imagem.");
    }, 8_000);
    return () => window.clearTimeout(timer);
  }, [preview, previewLoading]);

  function handleFileChange(file: File | undefined) {
    setError("");

    if (!file) {
      restoreCurrentPreview();
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type.toLowerCase())) {
      if (inputRef.current) inputRef.current.value = "";
      restoreCurrentPreview();
      setError("Formato inválido. Envie JPG, PNG, WebP ou AVIF.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      if (inputRef.current) inputRef.current.value = "";
      restoreCurrentPreview();
      setError("Imagem muito grande (máx. 5 MB).");
      return;
    }

    revokeObjectUrl();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setPreview(objectUrl);
    setPreviewLoading(true);
    setSelectedName(file.name);
  }

  return (
    <label className="block cursor-pointer">
      <span className="mb-1 block text-xs font-semibold text-ink/60">Foto</span>
      <span className="relative block h-20 w-20 overflow-hidden rounded-xl bg-sky ring-1 ring-navy/10">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Prévia da imagem selecionada"
            className="h-full w-full object-cover"
            onLoad={() => {
              setPreviewLoading(false);
              setError("");
            }}
            onError={() => {
              setPreviewLoading(false);
              setError("Não foi possível exibir esta imagem. Escolha outro arquivo.");
            }}
          />
        ) : (
          <span className="grid h-full place-items-center px-2 text-center text-xs text-ink/50">Imagem em breve</span>
        )}
        {previewLoading ? (
          <span className="absolute inset-0 grid place-items-center bg-white/80" aria-label="Carregando prévia">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
          </span>
        ) : null}
      </span>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="mt-2 block w-full text-xs"
        onChange={(event) => handleFileChange(event.currentTarget.files?.[0])}
      />
      {selectedName ? <span className="mt-1 block truncate text-[11px] text-ink/50">{selectedName}</span> : null}
      {error ? <span role="alert" className="mt-1 block text-xs font-normal text-red">{error}</span> : null}
    </label>
  );
}
