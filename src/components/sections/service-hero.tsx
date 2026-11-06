import Image from "next/image";
import styles from "./service-hero.module.css";

type Props = {
  title: string;
  image: {
    src: string;
    alt: string;
    /* Parte de la foto que se conserva al recortar; por defecto el centro. */
    position?: string;
  };
  /* "center": foto a todo el ancho con el titulo encima (Pantallas LED).
     "split": bloque negro con el titulo a la izquierda y la foto a la
     derecha (Experiencias). */
  variant?: "center" | "split";
};

// Portada de las paginas de servicio: ocupa poco mas de media pantalla, con
// velo oscuro sobre la foto y el nombre de la seccion.
export function ServiceHero({ title, image, variant = "center" }: Props) {
  return (
    <section
      className={`${styles.hero} ${styles[variant]}`}
      aria-labelledby="servicio-title"
    >
      <div className={styles.media}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={
            variant === "split" ? "(max-width: 760px) 100vw, 72vw" : "100vw"
          }
          priority
          className={styles.image}
          style={
            image.position ? { objectPosition: image.position } : undefined
          }
        />
        <div className={styles.veil} aria-hidden="true" />
      </div>
      <h1 id="servicio-title" className={styles.title}>
        {title}
      </h1>
    </section>
  );
}
