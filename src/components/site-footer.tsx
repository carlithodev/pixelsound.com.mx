import Image from "next/image";
import { SERVICE_GROUPS } from "@/lib/services";
import { ServiceLink } from "./service-link";
import styles from "./site-footer.module.css";

const SOCIALS = [
  {
    name: "Instagram",
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
    href: "https://www.tiktok.com/@pixel.sound17",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 3h3a4.5 4.5 0 0 0 4.5 4.5v3a7.5 7.5 0 0 1-4.5-1.5V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61579248047962",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.2c0-.9.3-1.5 1.5-1.5h1.4V5.1c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8v3h2.7v7h2.8z" />
      </svg>
    ),
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Image
              src="/images/logopixelsaund.png"
              alt="PixelSaund"
              width={933}
              height={532}
              quality={90}
              className={styles.logo}
            />
            {/* Linea provisional: la sustituye el usuario. */}
            <p className={styles.tagline}>
              Pantallas LED, escenarios y
              <br />
              producción para eventos.
            </p>
            <ul className={styles.socials} aria-label="Redes sociales">
              {SOCIALS.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className={styles.socialLink}
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {SERVICE_GROUPS.map((group) => (
            <div key={group.href} className={styles.column}>
              <p className={styles.heading}>
                {group.short === "Pantallas y personalización" ? (
                  <>
                    Pantallas y
                    <br />
                    personalización
                  </>
                ) : (
                  group.short
                )}
              </p>
              <ul className={styles.list}>
                {group.items.map((item) => (
                  <li key={item.href + item.label}>
                    <ServiceLink className={styles.link} href={item.href}>
                      {item.label}
                    </ServiceLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={styles.column}>
            <p className={styles.heading}>Contacto</p>
            <ul className={`${styles.list} ${styles.contact}`}>
              <li>
                <span className={styles.contactLabel}>WhatsApp</span>
                <a
                  href="https://wa.me/5216622288930"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactValue}
                >
                  662 228 8930
                </a>
              </li>
              <li>
                <span className={styles.contactLabel}>Ciudad</span>
                <span className={styles.contactValue}>Hermosillo, Sonora</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.legal}>
          <span>© 2026 PixelSound. Todos los derechos reservados.</span>
          {/* Sin destino hasta que exista el documento. */}
          <span className={styles.legalLink}>Aviso de privacidad</span>
        </div>
      </div>
    </footer>
  );
}
