"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SERVICE_GROUPS } from "@/lib/services";
import { ServiceLink } from "./service-link";
import styles from "./mobile-nav.module.css";

const WHATSAPP_URL = "https://wa.me/5216622288930";

// Menu de hamburguesa: sustituye a la barra de enlaces en pantallas chicas.
// El panel cubre la ventana, bloquea el scroll de fondo mientras esta
// abierto y se cierra al elegir cualquier destino, con Escape o al cambiar
// de pagina.
export function MobileNav() {
  const [abierto, setAbierto] = useState(false);
  const [montado, setMontado] = useState(false);
  const panelId = useId();
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const ruta = usePathname();

  useEffect(() => setMontado(true), []);

  // Al cambiar de pagina, el panel se cierra.
  // biome-ignore lint/correctness/useExhaustiveDependencies: la ruta es la senal de cierre
  useEffect(() => setAbierto(false), [ruta]);

  useEffect(() => {
    if (!abierto) return;

    const alTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") setAbierto(false);
    };
    // Cualquier destino cierra el panel. No basta con vigilar la ruta: un
    // salto de apartado dentro de la misma pagina no la cambia, y el menu se
    // quedaria encima tapandolo todo.
    const alElegir = (evento: MouseEvent) => {
      const destino = evento.target as HTMLElement | null;
      if (destino?.closest("a")) setAbierto(false);
    };
    // Con el panel abierto, la pagina de atras no se mueve.
    const hoja = panel.current;
    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", alTecla);
    hoja?.addEventListener("click", alElegir);
    hoja?.focus();

    return () => {
      document.body.style.overflow = scrollPrevio;
      document.removeEventListener("keydown", alTecla);
      hoja?.removeEventListener("click", alElegir);
      boton.current?.focus();
    };
  }, [abierto]);

  // El panel cuelga del cuerpo de la pagina, no de la barra. Dentro de la
  // barra quedaba preso: en cuanto esta se vuelve vidrio, su backdrop-filter
  // la convierte en bloque contenedor y el "position: fixed" del panel se
  // mide contra esos 56px de alto en lugar de contra la ventana.
  const hojaMenu = (
    <div
      ref={panel}
      id={panelId}
      className={styles.panel}
      data-abierto={abierto}
      tabIndex={-1}
      aria-hidden={!abierto}
      inert={!abierto}
    >
      <nav className={styles.lista} aria-label="Navegación principal">
        {SERVICE_GROUPS.map((grupo) => (
          <div key={grupo.href} className={styles.grupo}>
            <Link className={styles.titulo} href={grupo.href}>
              {grupo.title}
            </Link>
            <ul className={styles.apartados}>
              {grupo.items.map((item) => (
                <li key={item.href + item.label}>
                  <ServiceLink className={styles.apartado} href={item.href}>
                    {item.label}
                  </ServiceLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className={styles.sueltos}>
          <a className={styles.titulo} href="/#eventos">
            Eventos
          </a>
          <a className={styles.titulo} href="/#nosotros">
            Nosotros
          </a>
          <a className={styles.titulo} href="/#preguntas">
            Preguntas
          </a>
        </div>

        <a
          className={styles.cta}
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cotizar por WhatsApp
        </a>
      </nav>
    </div>
  );

  return (
    <>
      <button
        ref={boton}
        type="button"
        className={styles.boton}
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className={styles.trazos} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {montado ? createPortal(hojaMenu, document.body) : null}
    </>
  );
}
