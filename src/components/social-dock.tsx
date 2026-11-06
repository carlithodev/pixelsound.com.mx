"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./social-dock.module.css";

const WHATSAPP_URL = "https://wa.me/5216622288930";

// Las mismas cuentas que lista Nosotros, apiladas sobre la burbuja.
const REDES = [
  {
    nombre: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61579248047962",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.4V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8v3h2.7v7h2.8z" />
      </svg>
    ),
  },
  {
    nombre: "Instagram",
    href: "https://www.instagram.com/pixel.sound_pantallas/",
    icono: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    nombre: "TikTok",
    href: "https://www.tiktok.com/@pixel.sound17",
    icono: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 3h3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z" />
      </svg>
    ),
  },
];

export function SocialDock() {
  const [visible, setVisible] = useState(false);
  // Dentro de un modulo de servicios no aparece: ahi cada apartado lleva su
  // propia invitacion a escribir.
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/servicios/") ?? false;

  useEffect(() => {
    // Visible solo fuera del tope: al volver arriba del todo, se retira.
    const syncWithScroll = () => setVisible(window.scrollY > 0);

    // Mientras la pagina sea solo el hero, en escritorio puede no haber
    // desplazamiento real; la rueda imita la intencion: bajar muestra,
    // subir estando en el tope oculta.
    const syncWithWheel = (event: WheelEvent) => {
      if (window.scrollY > 0) return;
      if (event.deltaY > 0) setVisible(true);
      else if (event.deltaY < 0) setVisible(false);
    };

    syncWithScroll();
    window.addEventListener("scroll", syncWithScroll, { passive: true });
    window.addEventListener("wheel", syncWithWheel, { passive: true });
    return () => {
      window.removeEventListener("scroll", syncWithScroll);
      window.removeEventListener("wheel", syncWithWheel);
    };
  }, []);

  if (hidden) return null;

  return (
    <div className={styles.dock} data-visible={visible}>
      {REDES.map((red, indice) => (
        <a
          key={red.nombre}
          className={styles.mini}
          /* Entran una detras de otra, de abajo hacia arriba. */
          style={
            {
              "--retraso": `${(REDES.length - indice) * 60}ms`,
            } as React.CSSProperties
          }
          href={red.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={red.nombre}
        >
          {red.icono}
        </a>
      ))}

      <a
        className={styles.bubble}
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          src="/images/whatsapp.png"
          alt="WhatsApp"
          width={128}
          height={128}
          quality={90}
          className={styles.logo}
        />
        <span className={styles.label}>
          <span className={styles.labelText}>Cotiza Aquí!</span>
        </span>
      </a>
    </div>
  );
}
