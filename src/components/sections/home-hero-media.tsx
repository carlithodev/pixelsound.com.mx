"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAscensoEnEscritorio } from "@/lib/fuente-video";
import styles from "./home-hero-media.module.css";

// En pantallas chicas basta la copia ligera: pesa una cuarta parte y, con el
// recorte que hace el telefono, se ve igual.
const VIDEO_SRC = "/videos/hero-banner.mp4";
const VIDEO_SRC_SMALL = "/videos/hero-banner-720.mp4";
const POSTER = "/images/hero-banner-poster.jpg";

// Senales que cuentan para saber si el video ya esta en marcha.
const SENALES = ["playing", "timeupdate", "loadeddata"] as const;

export function HomeHeroMedia() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // El navegador nego el arranque (iOS en modo de bajo consumo, por ejemplo).
  // Solo entonces se deja la portada puesta: asi tapa el boton de play que
  // Safari dibuja encima. En cualquier otro caso el video se ve, corra o no.
  const [negado, setNegado] = useState(false);

  const arrancar = useCallback((video: HTMLVideoElement) => {
    // Safari mira el atributo, no solo la propiedad, y si duda del silencio
    // no arranca. Se reafirma antes de cada intento: no cuesta nada.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    const intento = video.play();
    if (!intento) return;
    intento.then(
      () => setNegado(false),
      () => setNegado(true),
    );
  }, []);

  useAscensoEnEscritorio(
    videoRef,
    VIDEO_SRC,
    VIDEO_SRC_SMALL,
    "(min-width: 901px)",
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Se mira el estado actual antes de atar nada: si el video ya venia
    // cargado (de la cache, en una segunda visita) sus eventos ya pasaron, y
    // quedarse esperandolos dejaria la portada encima para siempre.
    const revisar = () => {
      if (!video.paused && video.currentTime > 0) setNegado(false);
    };
    revisar();
    for (const senal of SENALES) video.addEventListener(senal, revisar);

    const soltarSenales = () => {
      for (const senal of SENALES) video.removeEventListener(senal, revisar);
    };

    // Quien pide menos movimiento se queda con la portada, que es el primer
    // cuadro del video: misma imagen, sin que nada se mueva.
    const quieto = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (quieto) {
      video.pause();
      video.removeAttribute("autoplay");
      return soltarSenales;
    }

    // iOS suele negar el primer intento si todavia no tiene datos y aceptarlo
    // un instante despues. Se reintenta en cada senal de avance en lugar de
    // rendirse al primer no.
    const intentar = () => arrancar(video);
    video.addEventListener("loadedmetadata", intentar);
    video.addEventListener("loadeddata", intentar);
    video.addEventListener("canplay", intentar);
    intentar();

    // Y si aun asi no arranco, el primer gesto de la persona lo desbloquea.
    // No se le pide nada: se aprovecha cualquier toque o desplazamiento.
    const opciones = { passive: true } as const;
    window.addEventListener("pointerdown", intentar, opciones);
    window.addEventListener("touchstart", intentar, opciones);
    window.addEventListener("scroll", intentar, opciones);

    // Fuera de pantalla se pausa: el decodificador deja de trabajar mientras
    // el visitante recorre el resto de la pagina.
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) intentar();
        else video.pause();
      },
      { threshold: 0.05 },
    );
    observador.observe(video);

    // Con la pestana en segundo plano tampoco tiene que correr.
    const alCambiarPestana = () => {
      if (document.hidden) video.pause();
      else if (video.getBoundingClientRect().bottom > 0) intentar();
    };
    document.addEventListener("visibilitychange", alCambiarPestana);

    return () => {
      soltarSenales();
      video.removeEventListener("loadedmetadata", intentar);
      video.removeEventListener("loadeddata", intentar);
      video.removeEventListener("canplay", intentar);
      window.removeEventListener("pointerdown", intentar);
      window.removeEventListener("touchstart", intentar);
      window.removeEventListener("scroll", intentar);
      document.removeEventListener("visibilitychange", alCambiarPestana);
      observador.disconnect();
    };
  }, [arrancar]);

  return (
    <div className={styles.media}>
      {/* El relevo de la portada al primer cuadro lo hace el navegador con el
          atributo "poster": es instantaneo y cae en el momento justo. Antes lo
          hacia React con un fundido, y el video acababa corriendo casi un
          segundo por debajo de una imagen quieta. */}
      <video
        ref={videoRef}
        className={styles.video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={POSTER}
        aria-hidden="true"
        tabIndex={-1}
      >
        <source media="(min-width: 901px)" src={VIDEO_SRC} type="video/mp4" />
        <source src={VIDEO_SRC_SMALL} type="video/mp4" />
      </video>
      {/* Solo cuando el navegador nego el arranque: iOS dibuja su boton de
          play encima del video parado, y esta capa lo tapa. En el caso normal
          no existe, y asi no estorba al relevo del navegador. */}
      {negado ? (
        // biome-ignore lint/performance/noImgElement: es el fondo del hero, no una foto de contenido
        <img
          className={styles.portada}
          src={POSTER}
          alt=""
          aria-hidden="true"
        />
      ) : null}
    </div>
  );
}
