import { Reveal } from "@/components/reveal";
import { HomeAboutMedia } from "./home-about-media";
import styles from "./home-about.module.css";

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@pixel.sound_pantallas",
    href: "https://www.instagram.com/pixel.sound_pantallas/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    handle: "@pixel.sound17",
    href: "https://www.tiktok.com/@pixel.sound17",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 3h3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    handle: "PixelSound",
    href: "https://www.facebook.com/profile.php?id=61579248047962",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.4V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8v3h2.7v7h2.8z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    handle: "662 228 8930",
    href: "https://wa.me/5216622288930",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zm4.4 12.4c-.2.5-1.1 1-1.5 1-.4.1-.9.1-1.4-.1-.3-.1-.8-.3-1.3-.5-2.3-1-3.8-3.3-3.9-3.5-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.1 0 .3 0 .5.4l.7 1.6c.1.1.1.3 0 .4l-.3.4-.3.4c-.1.1-.2.2-.1.4.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.2.2.1.4.1.5-.1l.7-.9c.2-.2.3-.2.5-.1l1.6.8c.2.1.4.2.4.3.1.1.1.6-.1 1.1z" />
      </svg>
    ),
  },
];

export function HomeAbout() {
  return (
    <section
      id="nosotros"
      className={styles.about}
      aria-labelledby="nosotros-title"
    >
      <Reveal className={styles.block}>
        <div className={styles.card}>
          <div className={styles.text}>
            <h2 id="nosotros-title" className={styles.title}>
              Años haciendo que cada evento{" "}
              <span className={styles.accent}>
                se vea, se sienta y se recuerde.
              </span>
            </h2>
            <p className={styles.description}>
              Años en el medio nos han enseñado que en un evento no hay margen
              de error. Nos encargamos de todo el montaje visual y la animación
              para que tú vivas la experiencia con total tranquilidad.
            </p>

            <nav className={styles.social} aria-label="Redes sociales">
              <p className={styles.socialLabel}>Síguenos</p>
              <ul className={styles.socialList}>
                {SOCIALS.map((social) => (
                  <li key={social.name}>
                    <a
                      className={styles.socialLink}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className={styles.socialIcon}>{social.icon}</span>
                      <span className={styles.socialName}>{social.name}</span>
                      <span className={styles.socialHandle}>
                        {social.handle}
                      </span>
                      <svg
                        className={styles.socialArrow}
                        viewBox="0 0 32 12"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M1 6h28.5m-6-5L30 6l-6 5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <HomeAboutMedia />
        </div>
      </Reveal>
    </section>
  );
}
