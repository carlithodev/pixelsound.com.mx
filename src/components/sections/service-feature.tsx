import type { CSSProperties } from "react";
import Image from "next/image";
import { CardVideo } from "./card-video";
import styles from "./service-feature.module.css";

type Media =
  | { kind: "image"; src: string; alt: string; sizes: string }
  | { kind: "video"; src: string; small?: string; poster: string };

type Props = {
  /* Etiqueta pequena sobre el titulo; opcional. */
  eyebrow?: string;
  title: string;
  /* Parte final del titulo que va en los colores del logo. */
  accent?: string;
  paragraphs: string[];
  /* Una pieza o varias, que van juntas y del mismo alto. */
  media: Media | Media[];
  /* Lado donde va la foto o el video; el texto ocupa el otro. */
  side?: "left" | "right";
  /* Proporcion de cada pieza, por si no es apaisada. */
  ratio?: string;
  /* Recorte sin fondo (PNG con transparencia): se muestra entero y sin
     esquinas redondeadas, directo sobre el fondo de la pagina. */
  bare?: boolean;
  /* Alto de una pieza vertical, por si en ese apartado va mas grande. */
  height?: string;
};

// Bloque de dos columnas: uno o dos medios grandes a un lado y un texto
// corto al otro, sin caja, como en las paginas de producto.
export function ServiceFeature({
  eyebrow,
  title,
  accent,
  paragraphs,
  media,
  side = "left",
  ratio = "16 / 9",
  bare = false,
  height = "clamp(420px, 64vh, 640px)",
}: Props) {
  const pieces = Array.isArray(media) ? media : [media];

  // Una pieza vertical se mide por su alto (si no, tendria que recortarse);
  // una apaisada ocupa todo el ancho de su columna. El alto viaja como
  // variable y no como estilo en linea: asi en movil el CSS puede mandar.
  const [w, h] = ratio.split("/").map((part) => Number(part.trim()));
  const portrait = w / h < 1;
  const size = { aspectRatio: ratio, "--alto": portrait ? height : "auto" };

  return (
    <section
      className={`${styles.feature} ${styles[side]} ${
        pieces.length > 1 ? styles.several : ""
      }`}
    >
      <div className={styles.frames}>
        {pieces.map((piece) => (
          <div
            key={piece.src}
            className={`${styles.media} ${bare ? styles.bare : ""} ${
              portrait ? styles.vertical : styles.apaisada
            }`}
            style={size as CSSProperties}
          >
            {piece.kind === "image" ? (
              <Image
                src={piece.src}
                alt={piece.alt}
                fill
                sizes={piece.sizes}
                className={styles.image}
              />
            ) : (
              <CardVideo
                src={piece.src}
                small={piece.small}
                poster={piece.poster}
                className={styles.video}
              />
            )}
          </div>
        ))}
      </div>
      <div className={styles.text}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h3 className={styles.title}>
          {title}
          {accent ? <span className={styles.accent}> {accent}</span> : null}
        </h3>
        {paragraphs.map((paragraph) => (
          <p key={paragraph} className={styles.paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  );
}
