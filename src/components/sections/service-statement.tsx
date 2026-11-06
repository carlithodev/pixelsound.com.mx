import Image from "next/image";
import { CardVideo } from "./card-video";
import styles from "./service-statement.module.css";

type Media =
  | { kind: "image"; src: string; alt: string; sizes: string }
  | { kind: "video"; src: string; small?: string; poster: string };

type Props = {
  eyebrow?: string;
  title: string;
  /* Parte final del titulo que va en los colores del logo. */
  accent?: string;
  lead?: string;
  media?: Media;
  /* Proporcion de la pieza y ancho maximo que puede ocupar. */
  ratio?: string;
  width?: string;
};

// Declaracion centrada: etiqueta, titulo grande, una linea de apoyo y, si
// hace falta, una pieza grande debajo.
export function ServiceStatement({
  eyebrow,
  title,
  accent,
  lead,
  media,
  ratio = "1 / 1",
  width = "min(560px, 100%)",
}: Props) {
  return (
    <section className={styles.statement}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h3 className={styles.title}>
        {title}
        {accent ? <span className={styles.accent}> {accent}</span> : null}
      </h3>
      {lead && <p className={styles.lead}>{lead}</p>}
      {media && (
        <div className={styles.media} style={{ aspectRatio: ratio, width }}>
          {media.kind === "image" ? (
            <Image
              src={media.src}
              alt={media.alt}
              fill
              sizes={media.sizes}
              className={styles.image}
            />
          ) : (
            <CardVideo
              src={media.src}
              small={media.small}
              poster={media.poster}
              className={styles.video}
            />
          )}
        </div>
      )}
    </section>
  );
}
