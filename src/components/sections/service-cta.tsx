import styles from "./service-cta.module.css";

const WHATSAPP = "https://wa.me/5216622288930";

type Props = {
  /* Mensaje que ya va escrito al abrir WhatsApp. */
  message: string;
  label?: string;
};

// Cierre de cada apartado: una linea discreta a la derecha y el boton que
// abre WhatsApp con el mensaje listo.
export function ServiceCta({
  message,
  label = "¿Te interesa para tu evento?",
}: Props) {
  return (
    <div className={styles.cta}>
      <p className={styles.label}>{label}</p>
      <a
        className={styles.button}
        href={`${WHATSAPP}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Escríbenos</span>
        <svg
          width="18"
          height="7"
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
    </div>
  );
}
