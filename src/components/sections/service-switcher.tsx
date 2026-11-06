"use client";

import { type ReactNode, useEffect, useState } from "react";
import { ServiceTabs } from "./service-tabs";
import styles from "./service-switcher.module.css";

type Section = {
  id: string;
  label: string;
  content: ReactNode;
};

type Props = {
  sections: Section[];
};

// Pildora + contenido de cada servicio. Todos los paneles quedan montados
// (los modelos 3D no se recrean); solo se muestra el activo, que entra con
// un fundido. Cada apartado tiene direccion propia: /servicios/x#apartado.
export function ServiceSwitcher({ sections }: Props) {
  const [active, setActive] = useState(0);

  // Al llegar con una direccion de apartado (o al cambiarla desde el menu),
  // se abre ese y la pildora queda a la vista.
  useEffect(() => {
    const open = (scroll: boolean) => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const index = sections.findIndex((section) => section.id === id);
      if (index < 0) return;
      setActive(index);
      if (!scroll) return;
      const tabs = document.querySelector('[role="tablist"]');
      tabs?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    };

    // Al venir desde el carrusel, Next conserva la altura a la que estaba la
    // pagina anterior. Llevamos la pildora al inicio despues de abrir el
    // apartado para que el usuario vea el comienzo del servicio elegido.
    open(true);
    const onHash = () => open(true);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [sections]);

  const change = (index: number) => {
    setActive(index);
    // La direccion acompana al apartado abierto, para poder compartirla.
    window.history.replaceState(null, "", `#${sections[index].id}`);
  };

  return (
    <>
      <ServiceTabs
        items={sections.map((section) => section.label)}
        active={active}
        onChange={change}
      />
      {sections.map((section, index) => (
        <div
          key={section.id}
          id={`servicio-${section.id}`}
          role="tabpanel"
          aria-label={section.label}
          className={styles.panel}
          hidden={index !== active}
        >
          {section.content}
        </div>
      ))}
    </>
  );
}
