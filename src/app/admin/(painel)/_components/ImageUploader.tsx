"use client";
import { useState } from "react";

// Mostra a foto atual e um seletor de arquivo com preview. Input com name configurável.
export function ImageUploader({ current, name = "imagem" }: { current?: string; name?: string }) {
  const [preview, setPreview] = useState<string | undefined>(current);
  return (
    <label className="block cursor-pointer">
      <span className="mb-1 block text-xs font-semibold text-ink/60">Foto</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="h-20 w-20 rounded-xl object-cover ring-1 ring-navy/10" />
      ) : (
        <span className="grid h-20 w-20 place-items-center rounded-xl bg-sky text-xs text-ink/50">sem foto</span>
      )}
      <input type="file" name={name} accept="image/*" className="mt-2 block w-full text-xs"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
    </label>
  );
}
