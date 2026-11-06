"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MobileNav } from "./mobile-nav";
import { ServicesMenu } from "./services-menu";
import styles from "./site-header.module.css";

// A partir de aqui la barra pasa de transparente a vidrio flotante.
const SCROLL_THRESHOLD = 24;

type Props = {
  /* Paginas interiores: la barra nace ya compacta y en vidrio. */
  compact?: boolean;
};

export function SiteHeader({ compact = false }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;
    const sync = () => {
      frame = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className={styles.header} data-scrolled={compact || scrolled}>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <div className={styles.bar}>
        <div className={styles.inner}>
          <a className={styles.brand} href="/" aria-label="PixelSaund, inicio">
            <Image
              src="/images/logopixelsaund.png"
              alt="PixelSaund"
              width={933}
              height={532}
              quality={90}
              className={styles.logo}
              loading="eager"
            />
          </a>
          <nav className={styles.navigation} aria-label="Navegación principal">
            <ServicesMenu />
            <a href="/#eventos">Eventos</a>
            <a href="/#nosotros">Nosotros</a>
          </nav>

          {/* De 900px para abajo, la barra de enlaces se va y manda este. */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
