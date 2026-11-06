"use client";

import { useEffect, useRef } from "react";
import { useAscensoEnEscritorio } from "@/lib/fuente-video";

type Props = {
  src: string;
  /* Copia ligera para telefonos, si ese video la tiene. */
  small?: string;
  poster: string;
  className?: string;
};

// Video en bucle que solo corre mientras esta a la vista (una pestana
// oculta lo pausa).
export function CardVideo({ src, small, poster, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useAscensoEnEscritorio(videoRef, src, small, "(min-width: 701px)");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      poster={poster}
      // "none" y no "metadata": con metadata el navegador se pasaba de
      // listo y acababa bajando el archivo entero de cada video, tambien
      // los de las pestanas cerradas. Aqui no se pide nada hasta que el
      // hueco entra en pantalla, que es cuando el observador lo arranca.
      preload="none"
      muted
      loop
      playsInline
      aria-hidden="true"
      tabIndex={-1}
    >
      {small ? (
        <>
          <source media="(min-width: 701px)" src={src} type="video/mp4" />
          <source src={small} type="video/mp4" />
        </>
      ) : (
        <source src={src} type="video/mp4" />
      )}
    </video>
  );
}
