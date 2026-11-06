import Image from "next/image";
import { CardVideo } from "./card-video";
import styles from "./service-card.module.css";

type Media =
  | { kind: "image"; src: string; alt: string; sizes: string }
  | { kind: "video"; src: string; small?: string; poster: string };

type Props = {
  eyebrow: string;
  title: string;
  /* Parte final del titulo que va en los colores del logo. */
  accent: string;
  description: string;
  media: Media;
  /* "tall": columna alta (Audio). "wide": apaisada con la foto abajo
     (Pantallas). "split": apaisada con texto a la izquierda y video a la
     derecha (Iluminacion). */
  variant: "tall" | "wide" | "split";
};

// Tarjeta con texto arriba y foto o video que llena el resto, fundido desde
// el color de la tarjeta.
export function ServiceCard({
  eyebrow,
  title,
  accent,
  description,
  media,
  variant,
}: Props) {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.title}>
          {title} <span className={styles.accent}>{accent}</span>
        </h2>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.media}>
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
    </article>
  );
}
