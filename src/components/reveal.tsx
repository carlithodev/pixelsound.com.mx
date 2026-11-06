"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type RevealState = "idle" | "pending" | "visible";

// Envuelve un bloque y le pone data-reveal="pending" al montar y "visible"
// cuando entra en pantalla. Sin JavaScript no hay atributo: el bloque se ve.
export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<RevealState>("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Ya visible al montar (recarga a mitad de pagina): no se esconde nada.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) return;

    setState("pending");
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("visible");
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      data-reveal={state === "idle" ? undefined : state}
    >
      {children}
    </div>
  );
}
