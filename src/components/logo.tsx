// src/components/Logo.tsx
'use client';

import React, { useEffect, useRef, useState } from "react";
import bundledLogo from "../assets/logo.png";        // fallback from src/assets

// Public paths (put files under /public)
const PUBLIC_LOGO = "/logo.png";


type Props = {
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  position?: 'absolute' | 'relative' | 'static' | 'fixed' | 'sticky';
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
};

export default function Logo({
  width = 160,
  height = 80,
  alt = "Bedrock logo",
  className,
  position,
  top,
  left,
  right,
  bottom,
}: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [src, setSrc] = useState<string>(bundledLogo.src); // start with bundler fallback
  const [srcSet, setSrcSet] = useState<string>("");

  const dynamicStyles = {
    position: position,
    top: top,
    left: left,
    right: right,
    bottom: bottom,
  };

  // 1) Try the public path first (load test). If it loads, prefer it.
  useEffect(() => {
    let mounted = true;
    const test = new Image();
    test.onload = () => {
      if (!mounted) return;
      // Use the public file (no cache stamp for normal use). Adding timestamp only here while testing
      setSrc(PUBLIC_LOGO);
      // only set srcset if a 2x public file likely exists (we won't verify with HEAD)
    };
    test.onerror = () => {
      if (!mounted) return;
      // fallback to bundled asset(s)
      setSrc(bundledLogo.src);

    };
    // attach a cache-busting query while testing to avoid stale dev-server caching:
    test.src = PUBLIC_LOGO + "?_=" + Date.now();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Protect image from being overwritten by other scripts (MutationObserver)
  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const desired = () => localStorage.getItem("bedrock_custom_logo") || src;
    // immediately ensure element has desired src
    if (el.getAttribute("src") !== desired()) {
      el.setAttribute("src", desired());
      if (desired() === PUBLIC_LOGO && srcSet) el.setAttribute("srcset", srcSet);
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type !== "attributes") continue;
        const attr = (m as MutationRecord).attributeName;
        if (attr !== "src" && attr !== "srcset") continue;

        const cur = el.getAttribute("src") || "";
        const des = desired();
        // If different, restore desired (we treat data: and paths carefully)
        const different =
          (cur.startsWith("data:") || des.startsWith("data:"))
            ? cur !== des
            : !cur.endsWith(des) && cur !== des;

        if (different) {
          // Slight delay to avoid fighting a rapid loop
          setTimeout(() => {
            el.setAttribute("src", des);
            if (des === PUBLIC_LOGO && srcSet) el.setAttribute("srcset", srcSet);
          }, 12);
        }
      }
    });

    observer.observe(el, { attributes: true, attributeFilter: ["src", "srcset"] });
    return () => observer.disconnect();
  }, [src, srcSet]);

  // Allow external override via saved localStorage (useful during dev to test alternate PNG)
  const effectiveSrc = (typeof window !== 'undefined' ? localStorage.getItem("bedrock_custom_logo") : null) || src;
  const effectiveSrcSet = (typeof window !== 'undefined' && localStorage.getItem("bedrock_custom_logo")) ? "" : srcSet;

  return (
    <img
      ref={imgRef}
      src={effectiveSrc}
      srcSet={effectiveSrcSet || undefined}
      width={width}
      height={height}
      alt={alt}
      className={className}
      style={{
        ...dynamicStyles,
        display: "block",
        maxWidth: "100%",
        height: "auto",
        backgroundColor: "transparent",
        mixBlendMode: "multiply",
        filter: "contrast(1.1) brightness(1.05)"
      }}
      draggable={false}
    />
  );
}
