"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/reveal";
import { CountUp } from "./count-up";
import styles from "./home-events.module.css";

type EventCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  video: string;
};

// Descripciones provisionales: las sustituye el usuario.
const EVENTS: EventCard[] = [
  {
    id: "graduaciones",
    title: "Graduaciones",
    description: "Un cierre a la altura de todo el esfuerzo.",
    image: "/images/eventos/graduaciones.jpg",
    video: "/videos/eventos/graduaciones.mp4",
  },
  {
    id: "eventos-grandes",
    title: "Eventos masivos",
    description: "Miles de personas, una sola experiencia.",
    image: "/images/eventos/eventos-grandes.jpg",
    video: "/videos/eventos/eventos-grandes.mp4",
  },
  {
    id: "fiestas",
    title: "Fiestas",
    description: "La noche que todos van a recordar.",
    image: "/images/eventos/fiestas.jpg",
    video: "/videos/eventos/fiestas.mp4",
  },
  {
    id: "conciertos",
    title: "Conciertos",
    description: "Escenario, luz y sonido que se sienten.",
    image: "/images/eventos/conciertos.jpg",
    video: "/videos/eventos/conciertos.mp4",
  },
  {
    id: "bodas",
    title: "Bodas",
    description: "Cada detalle, tan perfecto como el día.",
    image: "/images/eventos/bodas.jpg",
    video: "/videos/eventos/bodas.mp4",
  },
];

// El video de estas tarjetas es un detalle de cursor: se enciende al pasar
// por encima. En un telefono o una tableta no hay cursor, el "pasar por
// encima" se convierte en el propio toque y el video arranca donde nadie lo
// pidio. Ahi la tarjeta se queda en foto, titulo y texto, que es lo que hay
// que leer, y ni siquiera se descarga el video.
const CON_CURSOR = "(hover: hover) and (pointer: fine)";

function Card({ event }: { event: EventCard }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Arranca en falso: mientras no se sepa, no se pinta el video. El servidor
  // no puede saberlo y equivocarse hacia el lado que descarga de mas seria
  // justo lo que se quiere evitar.
  const [conCursor, setConCursor] = useState(false);

  useEffect(() => {
    const consulta = window.matchMedia(CON_CURSOR);
    const sincronizar = () => setConCursor(consulta.matches);
    sincronizar();
    consulta.addEventListener("change", sincronizar);
    return () => consulta.removeEventListener("change", sincronizar);
  }, []);

  // El video se carga solo la primera vez que el cursor entra en la tarjeta.
  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia(CON_CURSOR).matches) return;
    if (!video.getAttribute("src")) video.src = event.video;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [event.video]);

  const stop = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
  }, []);

  return (
    <article
      className={styles.card}
      onPointerEnter={conCursor ? play : undefined}
      onPointerLeave={conCursor ? stop : undefined}
    >
      <Image
        src={event.image}
        alt=""
        width={960}
        height={1000}
        sizes="(max-width: 760px) 86vw, (max-width: 1100px) 46vw, 30vw"
        className={styles.image}
      />
      {conCursor ? (
        <video
          ref={videoRef}
          className={styles.video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
      <div className={styles.shade} aria-hidden="true" />
      <div className={styles.text}>
        <h3 className={styles.title}>{event.title}</h3>
        <p className={styles.description}>{event.description}</p>
      </div>
    </article>
  );
}

export function HomeEvents() {
  return (
    <section
      id="eventos"
      className={styles.events}
      aria-labelledby="eventos-title"
    >
      <Reveal className={styles.inner}>
        <h2 id="eventos-title" className={styles.heading}>
          Para cada momento,{" "}
          <span className={styles.accent}>
            hay una forma de hacerlo grande.
          </span>
        </h2>
        <div className={styles.cuerpo}>
          {/* Izquierda: el numero manda y debajo la explicacion. */}
          <div className={styles.info}>
            <p className={styles.numero}>
              <CountUp hasta={300} prefijo="+" className={styles.accent} />
            </p>
            <p className={styles.etiqueta}>eventos montados</p>
            <p className={styles.textoInfo}>
              Más de una década montando eventos en Hermosillo: graduaciones,
              bodas, conciertos y fiestas privadas. Cada evento llega con su
              propio reto y sale con el mismo equipo detrás.
            </p>
          </div>

          {/* Derecha: dos, dos y una. */}
          <div className={styles.grid}>
            {EVENTS.map((event) => (
              <Card key={event.id} event={event} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
