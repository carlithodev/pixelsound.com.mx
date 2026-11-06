"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  hasta: number;
  prefijo?: string;
  /* Cuanto tarda en llegar, en milisegundos. */
  duracion?: number;
  className?: string;
};

// Arranca en cero y sube hasta el numero cuando el bloque entra en pantalla.
// Sale del servidor con el valor final: sin JavaScript se lee igual, y el
// lector de pantalla siempre anuncia el numero completo, no la cuenta.
export function CountUp({
  hasta,
  prefijo = "",
  duracion = 1600,
  className,
}: Props) {
  const nodo = useRef<HTMLSpanElement>(null);
  const [valor, setValor] = useState(hasta);

  useEffect(() => {
    const el = nodo.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Ya visible al cargar (recarga a mitad de pagina): no se esconde nada.
    const caja = el.getBoundingClientRect();
    if (caja.top < window.innerHeight * 0.85 && caja.bottom > 0) return;

    setValor(0);
    let frame = 0;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        observador.disconnect();
        const arranque = performance.now();
        const paso = (ahora: number) => {
          const t = Math.min(1, (ahora - arranque) / duracion);
          // Frena al final: sube rapido y se acomoda en el numero.
          const curva = 1 - (1 - t) ** 3;
          setValor(Math.round(hasta * curva));
          if (t < 1) frame = window.requestAnimationFrame(paso);
        };
        frame = window.requestAnimationFrame(paso);
      },
      { threshold: 0.4 },
    );
    observador.observe(el);
    return () => {
      observador.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [hasta, duracion]);

  return (
    <span ref={nodo} className={className}>
      <span aria-hidden="true">
        {prefijo}
        {valor}
      </span>
      <span className="sr-only">{`${prefijo}${hasta}`}</span>
    </span>
  );
}
