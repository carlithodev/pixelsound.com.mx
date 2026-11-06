"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Reveal } from "@/components/reveal";
import styles from "./home-intro.module.css";

const limitar = (valor: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, valor));

// Curva suave en las dos puntas: el movimiento arranca y frena sin golpes.
const suave = (t: number) => t * t * (3 - 2 * t);

// Franja entre el banner y Servicios. La franja se clava a media pantalla
// mientras la seccion pasa: el logo crece hasta llenar el campo gris, se
// sostiene, y al seguir bajando se encoge mientras entra el texto. La escena
// termina antes de que la seccion suelte el scroll, asi que nadie se va a la
// siguiente con el texto a medias. El avance sale de la posicion, no de un
// temporizador: si te regresas, la escena se regresa contigo.
export function HomeIntro() {
  const seccion = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = seccion.current;
    if (!el) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");
    const angosto = window.matchMedia("(max-width: 860px)");

    let frame = 0;
    const pintar = () => {
      frame = 0;
      // El avance arranca en cuanto la franja asoma por abajo, no cuando se
      // clava: asi el logo ya viene creciendo antes de que la sección llene
      // la pantalla y nadie lo alcanza a ver chiquito y quieto.
      const caja = el.getBoundingClientRect();
      const avance =
        caja.height <= 0
          ? 1
          : limitar((window.innerHeight - caja.top) / caja.height);

      // Cuatro tramos: crecer mientras sube, sostenerse ya clavada, encoger
      // con el texto entrando, y un remate quieto antes de soltar el scroll.
      const crece = suave(limitar((avance - 0.04) / 0.4));
      const encoge = suave(limitar((avance - 0.58) / 0.22));
      const texto = suave(limitar((avance - 0.6) / 0.2));

      // 1 es el tamano final; 3.7 llena el campo gris.
      el.style.setProperty(
        "--logo-scale",
        (0.86 + crece * 2.84 - encoge * 2.7).toFixed(3),
      );
      el.style.setProperty("--logo-y", `${((1 - encoge) * 132).toFixed(1)}px`);
      el.style.setProperty("--text-p", texto.toFixed(3));
    };

    const aFrame = () => {
      if (!frame) frame = window.requestAnimationFrame(pintar);
    };

    // Sin escena: en movil y con movimiento reducido todo se queda en su
    // estado final, que es el que trae el CSS por defecto.
    const encender = () => {
      window.removeEventListener("scroll", aFrame);
      window.removeEventListener("resize", aFrame);
      if (quieto.matches || angosto.matches) {
        el.style.removeProperty("--logo-scale");
        el.style.removeProperty("--logo-y");
        el.style.removeProperty("--text-p");
        return;
      }
      window.addEventListener("scroll", aFrame, { passive: true });
      window.addEventListener("resize", aFrame);
      pintar();
    };

    encender();
    quieto.addEventListener("change", encender);
    angosto.addEventListener("change", encender);

    return () => {
      window.removeEventListener("scroll", aFrame);
      window.removeEventListener("resize", aFrame);
      quieto.removeEventListener("change", encender);
      angosto.removeEventListener("change", encender);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section
      ref={seccion}
      className={styles.intro}
      aria-labelledby="intro-title"
    >
      <div className={styles.stage}>
        <Reveal className={styles.media}>
          <Image
            className={styles.image}
            src="/images/inicio/equipo-vertical.jpg"
            alt="Equipo de PixelSound frente a una pantalla LED"
            width={1086}
            height={854}
            quality={88}
            sizes="(max-width: 860px) 100vw, 48vw"
          />
        </Reveal>

        <div className={styles.block}>
          <Image
            className={styles.logo}
            src="/images/logopixelsaund.png"
            alt=""
            width={940}
            height={539}
            quality={90}
            sizes="(max-width: 860px) 150px, 600px"
          />
          <div className={styles.text}>
            <h2 id="intro-title" className={styles.title}>
              Detrás de cada evento,{" "}
              <span className={styles.accent}>un equipo completo</span>
            </h2>
            <p className={styles.description}>
              PixelSound es una empresa hermosillense de producción audiovisual
              para eventos. Somos un equipo de técnicos en pantallas LED, audio,
              iluminación y contenido, para quien necesita que todo funcione
              como una sola pieza.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
