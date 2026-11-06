import { HomeHeroMedia } from "./home-hero-media";
import styles from "./home-hero.module.css";

const WHATSAPP_URL = "https://wa.me/5216622288930";

export function HomeHero() {
  return (
    <section id="inicio" className={styles.hero} aria-labelledby="hero-title">
      <HomeHeroMedia />

      <div className={styles.content}>
        <h1 id="hero-title" className={styles.title}>
          <span className={styles.titleIntro}>Pantallas LED y escenarios</span>
          <span className={styles.titleAccent}>Que impactan</span>
        </h1>
        <p className={styles.description}>
          Proyectamos tu evento, Capturamos el momento y Elevamos la experiencia
        </p>
        <div className={styles.actions}>
          <a className={`${styles.button} ${styles.primary}`} href="#servicios">
            Ver servicios
          </a>
          <a
            className={`${styles.button} ${styles.secondary}`}
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Cotizar
          </a>
        </div>
      </div>
    </section>
  );
}
