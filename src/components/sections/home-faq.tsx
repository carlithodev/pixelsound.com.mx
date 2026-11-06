import { Reveal } from "@/components/reveal";
import { SiteMap } from "./site-map";
import styles from "./home-faq.module.css";

// Coordenadas del negocio: las usa el boton de ruta; el mapa las lleva en
// su propio componente.
const RUTA =
  "https://www.google.com/maps/dir/?api=1&destination=29.0948359,-110.9583663";

// Respuestas provisionales: las sustituye el usuario.
const PREGUNTAS = [
  {
    p: "¿Con cuánta anticipación hay que apartar la fecha?",
    r: "De tres a seis semanas para una fecha normal. En temporada de graduaciones conviene apartar con dos o tres meses.",
  },
  {
    p: "¿Tienen fechas disponibles?",
    r: "Comunícate con nosotros y te compartimos las fechas disponibles.",
  },
  {
    p: "¿Trabajan fuera de Hermosillo?",
    r: "Por el momento trabajamos solo en Hermosillo. Próximamente ampliaremos nuestra cobertura.",
  },
  {
    p: "¿Qué necesitan del lugar?",
    r: "Acceso para descargar el equipo, una toma de corriente cerca y el espacio libre a la hora acordada para montar.",
  },
];

export function HomeFaq() {
  return (
    <section
      id="preguntas"
      className={styles.faq}
      aria-label="Preguntas frecuentes y ubicación"
    >
      <Reveal className={styles.inner}>
        <div className={styles.cuerpo}>
          <div className={styles.columna}>
            <h2 className={styles.titulo}>
              Preguntas <span className={styles.accent}>frecuentes</span>
            </h2>

            {/* details/summary: abre y cierra sin JavaScript. */}
            <ul className={styles.lista}>
              {PREGUNTAS.map((item) => (
                <li key={item.p}>
                  <details className={styles.item}>
                    <summary className={styles.pregunta}>
                      <span>{item.p}</span>
                      <svg
                        className={styles.cruz}
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M7 1v12M1 7h12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </summary>
                    <p className={styles.respuesta}>{item.r}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.columna}>
            <h2 className={styles.titulo}>
              ¿Dónde nos <span className={styles.accent}>ubicamos</span>?
            </h2>

            <div className={styles.mapa}>
              <SiteMap />

              <div className={styles.tarjeta}>
                <p className={styles.lugar}>PixelSound</p>
                <p className={styles.direccion}>
                  Nayarit #38, San Benito · 83190 Hermosillo, Son.
                </p>
                <a
                  className={styles.ruta}
                  href={RUTA}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cómo llegar
                  <svg
                    width="22"
                    height="10"
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
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
