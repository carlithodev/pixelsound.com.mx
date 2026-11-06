"use client";

import { useLayoutEffect, useRef } from "react";
import styles from "./service-tabs.module.css";

type Props = {
  items: string[];
  active: number;
  onChange: (index: number) => void;
};

// Pildora con los servicios de la pagina; el padre decide cual esta activo.
export function ServiceTabs({ items, active, onChange }: Props) {
  const pillRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // La burbuja se coloca midiendo el boton activo y se desliza hasta el
  // siguiente. La transicion se enciende un cuadro despues de la primera
  // medida para que no entre deslizandose desde el borde.
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const bubble = bubbleRef.current;
    const tab = tabRefs.current[active];
    if (!pill || !bubble || !tab) return;

    const place = () => {
      bubble.style.transform = `translateX(${tab.offsetLeft}px)`;
      bubble.style.width = `${tab.offsetWidth}px`;
    };
    place();
    const frame = window.requestAnimationFrame(() => {
      bubble.dataset.ready = "true";
    });

    // Si cambia el tamano (fuentes, viewport), se vuelve a medir.
    const observer = new ResizeObserver(place);
    observer.observe(pill);
    observer.observe(tab);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active]);

  return (
    <div className={styles.wrap}>
      <div
        ref={pillRef}
        className={styles.pill}
        role="tablist"
        aria-label="Servicios"
      >
        <span ref={bubbleRef} className={styles.bubble} aria-hidden="true" />
        {items.map((item, index) => (
          <button
            key={item}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            className={styles.tab}
            aria-selected={index === active}
            onClick={() => onChange(index)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
