"use client";

import { useEffect, useRef } from "react";
import styles from "./home-about.module.css";

// Tres clips de 8.000 s exactos, en bucle sincronizado.
const CLIPS = [
  {
    src: "/videos/nosotros/staff-1.mp4",
    small: "/videos/nosotros/staff-1-720.mp4",
    poster: "/images/nosotros/staff-1.jpg",
  },
  {
    src: "/videos/nosotros/staff-2.mp4",
    small: "/videos/nosotros/staff-2-720.mp4",
    poster: "/images/nosotros/staff-2.jpg",
  },
  {
    src: "/videos/nosotros/staff-3.mp4",
    small: "/videos/nosotros/staff-3-720.mp4",
    poster: "/images/nosotros/staff-3.jpg",
  },
];

export function HomeAboutMedia() {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Solo reproducen mientras la pila esta a la vista; al entrar arrancan los
  // tres desde cero para que queden en fase.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const videos = Array.from(wrap.querySelectorAll("video"));
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Arrancan escalonados: encender tres decodificadores en el mismo cuadro
    // clavaba la pagina. Siguen en fase porque los tres duran lo mismo y se
    // reinician desde cero.
    const relojes: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        for (const reloj of relojes.splice(0)) window.clearTimeout(reloj);
        videos.forEach((video, indice) => {
          if (entry.isIntersecting && !reduceMotion) {
            relojes.push(
              window.setTimeout(() => {
                video.currentTime = 0;
                void video.play().catch(() => {});
              }, indice * 140),
            );
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(wrap);
    return () => {
      for (const reloj of relojes) window.clearTimeout(reloj);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.stack}>
      {CLIPS.map((clip) => (
        <div key={clip.src} className={styles.clip}>
          {/* La copia pesada va primero con su consulta y la ligera al
              final sin ninguna: Safari ignora "media" y se queda con la
              ultima, que es justo la que le conviene al telefono. */}
          <video
            className={styles.video}
            poster={clip.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source
              media="(min-width: 701px)"
              src={clip.src}
              type="video/mp4"
            />
            <source src={clip.small} type="video/mp4" />
          </video>
        </div>
      ))}
    </div>
  );
}
