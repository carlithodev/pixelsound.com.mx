"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SERVICE_GROUPS } from "@/lib/services";
import { ServiceLink } from "./service-link";
import styles from "./services-menu.module.css";

// Retardo al entrar y al salir con el cursor: evita que el panel salte solo
// cuando se pasa por encima de camino a otro enlace.
const OPEN_DELAY = 120;
const CLOSE_DELAY = 180;
const MARGIN = 16;

type Position = { top: number; left: number; width?: number };

export function ServicesMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const panelId = useId();
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // El panel cuelga del cuerpo de la pagina, no de la barra: solo asi el
  // vidrio desenfoca lo que pasa por detras.
  const place = useCallback(() => {
    const button = trigger.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    if (window.innerWidth <= 760) {
      setPosition({
        top: rect.bottom + 10,
        left: MARGIN,
        width: window.innerWidth - MARGIN * 2,
      });
      return;
    }
    const width = panel.current?.offsetWidth ?? 620;
    const centered = rect.left + rect.width / 2 - width / 2;
    const max = window.innerWidth - width - MARGIN;
    setPosition({
      top: rect.bottom + 12,
      left: Math.min(Math.max(centered, MARGIN), max),
    });
  }, []);

  // Cerrar de verdad. Al elegir un enlace el cursor acaba de entrar al panel,
  // asi que hay un temporizador de apertura en marcha: sin cancelarlo, el
  // panel vuelve a abrirse solo 120 ms despues.
  const cerrar = useCallback(() => {
    window.clearTimeout(timer.current);
    setOpen(false);
  }, []);

  // Red de seguridad: al cambiar de pagina el panel se cierra. El cierre
  // normal lo hace cada enlace al pulsarse, porque un salto de apartado en la
  // misma pagina no cambia la ruta y este efecto no se enteraria.
  // biome-ignore lint/correctness/useExhaustiveDependencies: la ruta es la senal de cierre
  useEffect(() => cerrar(), [pathname]);

  useEffect(() => {
    if (!open) return;
    place();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") cerrar();
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        trigger.current?.contains(target) ||
        panel.current?.contains(target)
      ) {
        return;
      }
      cerrar();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
    };
  }, [open, place, cerrar]);

  // El cursor se atiende desde los propios nodos, sin manejadores de raton
  // en el marcado.
  // biome-ignore lint/correctness/useExhaustiveDependencies: se ata una vez montado el panel
  useEffect(() => {
    const button = trigger.current;
    if (!button) return;
    const schedule = (next: boolean, delay: number) => {
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setOpen(next), delay);
    };
    const enter = () => schedule(true, OPEN_DELAY);
    const leave = () => schedule(false, CLOSE_DELAY);
    const nodes = [button, panel.current].filter(Boolean) as HTMLElement[];
    for (const node of nodes) {
      node.addEventListener("mouseenter", enter);
      node.addEventListener("mouseleave", leave);
    }
    return () => {
      window.clearTimeout(timer.current);
      for (const node of nodes) {
        node.removeEventListener("mouseenter", enter);
        node.removeEventListener("mouseleave", leave);
      }
    };
  }, [mounted]);

  const content = (
    <div
      ref={panel}
      id={panelId}
      className={styles.panel}
      data-open={open}
      style={
        position
          ? { top: position.top, left: position.left, width: position.width }
          : undefined
      }
    >
      <div className={styles.columns}>
        {SERVICE_GROUPS.map((group) => (
          <div key={group.href} className={styles.column}>
            <Link className={styles.title} href={group.href} onClick={cerrar}>
              {group.title}
            </Link>
            <ul className={styles.list}>
              {group.items.map((item) => (
                <li key={item.href + item.label}>
                  <ServiceLink
                    className={styles.item}
                    href={item.href}
                    onNavigate={cerrar}
                  >
                    {item.label}
                  </ServiceLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.wrap}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          window.clearTimeout(timer.current);
          setOpen((value) => !value);
        }}
      >
        <span>Servicios</span>
        <svg
          className={styles.chevron}
          width="11"
          height="7"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5 6 6.5l5-5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {mounted ? createPortal(content, document.body) : null}
    </div>
  );
}
