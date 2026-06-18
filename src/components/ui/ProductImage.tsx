"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { FALLBACK_IMAGE, productImage } from "@/lib/images";

export function ProductImage({
  src,
  alt,
  className = "",
  loading = "lazy"
}: {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  const [imageSrc, setImageSrc] = useState(productImage(src));
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc(productImage(src));
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    // Cached images can complete before onLoad fires.
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, [imageSrc]);

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {!loaded ? <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-navy/10" /> : null}
      <img
        ref={ref}
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setImageSrc(FALLBACK_IMAGE);
          setLoaded(true);
        }}
        className={`h-full w-full object-contain transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
}
