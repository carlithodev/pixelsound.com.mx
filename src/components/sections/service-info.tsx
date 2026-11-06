import styles from "./service-info.module.css";

type Item = {
  term: string;
  detail: string;
};

type Props = {
  /* Etiqueta pequena arriba del titulo; opcional. */
  eyebrow?: string;
  title: string;
  paragraphs: string[];
  items: Item[];
};

// Bloque explicativo de un servicio: titulo (con etiqueta opcional),
// parrafos y una lista de puntos con hilos, en la misma tipografia del sitio.
export function ServiceInfo({ eyebrow, title, paragraphs, items }: Props) {
  return (
    <section className={styles.info} aria-label={title}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h3 className={styles.title}>{title}</h3>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className={styles.paragraph}>
          {paragraph}
        </p>
      ))}
      <dl className={styles.items}>
        {items.map((item) => (
          <div key={item.term} className={styles.item}>
            <dt className={styles.term}>{item.term}</dt>
            <dd className={styles.detail}>{item.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
