"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import styles from "./screen-viewer.module.css";

// Cada escena es su propio paquete: se descarga cuando hace falta y, si el
// navegador tiene un hueco libre, se adelanta la descarga para que cambiar
// de pestana sea instantaneo.
const IMPORTERS = {
  creativo: () =>
    import("./creative-wall-scene").then((module) => module.CreativeWallScene),
  individual: () =>
    import("./single-wall-scene").then((module) => module.SingleWallScene),
  curva: () =>
    import("./curved-wall-scene").then((module) => module.CurvedWallScene),
  colgante: () =>
    import("./hanging-wall-scene").then((module) => module.HangingWallScene),
  ancha: () =>
    import("./raised-wall-scene").then((module) => module.RaisedWallScene),
  lineArray: () =>
    import("./line-array-scene").then((module) => module.LineArrayScene),
  bocinas: () =>
    import("./speaker-stands-scene").then(
      (module) => module.SpeakerStandsScene,
    ),
  apilados: () =>
    import("./ground-stack-scene").then((module) => module.GroundStackScene),
  luces: () =>
    import("./moving-heads-scene").then((module) => module.MovingHeadsScene),
  circuito: () =>
    import("./circuit-scene").then((module) => module.CircuitScene),
  simetrico: () =>
    import("./symmetric-wall-scene").then(
      (module) => module.SymmetricWallScene,
    ),
} as const;

type Model = keyof typeof IMPORTERS;

type Specification = {
  label: string;
  size: string;
};

const SCENES = Object.fromEntries(
  Object.entries(IMPORTERS).map(([key, importer]) => [
    key,
    dynamic(importer, {
      ssr: false,
      loading: () => <div className={styles.loading} />,
    }),
  ]),
) as Record<Model, ReturnType<typeof dynamic>>;

/* Cola de encendido: armar una escena (texturas, materiales, primer
   cuadro) ocupa el hilo principal un momento. Si varias se encienden a la
   vez, la pagina se traba; asi que se encienden de una en una, en el orden
   en que entran en pantalla, dejando respirar al navegador entre cada una. */
// Cada escena avisa cuando su lienzo ya existe de verdad. No basta con
// pedirle a React que la dibuje: el codigo de la escena todavia viene en
// camino, y si la cola se libera ahi, cuatro contextos de WebGL acaban
// naciendo con milisegundos de diferencia y la pagina da un tiron.
type Aviso = (listo: () => void) => void;

const MOUNT_QUEUE: Aviso[] = [];
let mounting = false;

// Si una escena no llega a avisar (fallo la descarga, por ejemplo), la cola
// no se queda trabada para siempre.
const PLAZO_MAXIMO = 6000;

function pumpQueue() {
  if (mounting || MOUNT_QUEUE.length === 0) return;
  const next = MOUNT_QUEUE.shift();
  mounting = true;

  let soltado = false;
  const soltar = () => {
    if (soltado) return;
    soltado = true;
    window.clearTimeout(rescate);
    // Esperar a que el navegador tenga un hueco libre: si el usuario va
    // desplazandose, la siguiente escena no se arma encima de su scroll.
    onIdle(() => {
      mounting = false;
      pumpQueue();
    }, 900);
  };

  const rescate = window.setTimeout(soltar, PLAZO_MAXIMO);
  next?.(soltar);
}

function queueMount(run: Aviso) {
  MOUNT_QUEUE.push(run);
  pumpQueue();
}

/* Un lienzo 3D ocupa un contexto de WebGL y el navegador solo presta unos
   pocos. Los modelos de una pestana cerrada sueltan el suyo pasado un rato;
   al volver se encienden de nuevo, ya con su codigo y sus texturas en
   memoria. Los de la pestana abierta se quedan listos aunque esten fuera de
   pantalla: no gastan nada (solo dibujan cuando algo cambia) y asi aparecen
   sin espera al bajar. */
const RELEASE_DELAY = 20000;

// Un hueco escondido (pestana cerrada) no ocupa espacio en la pagina.
function isHidden(element: HTMLElement) {
  return element.getBoundingClientRect().width === 0;
}

function onIdle(run: () => void, timeout: number) {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(run, { timeout });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(run, Math.min(timeout, 600));
  return () => window.clearTimeout(handle);
}

const LABELS = {
  creativo: "Pantalla LED en formato creativo sobre tarima, modelo 3D",
  individual: "Pantalla LED individual sobre tarima, modelo 3D",
  curva: "Pantalla LED curva sobre el piso, modelo 3D",
  colgante:
    "Pantallas LED colgantes de truss con franja sobre tarima, modelo 3D",
  ancha: "Pantalla LED ancha sobre tarima, modelo 3D",
  simetrico:
    "Muro LED simetrico sobre tarima con franja al frente en el piso, modelo 3D",
  lineArray:
    "Line array de tres bafles por lado colgado de un pórtico de truss, modelo 3D",
  bocinas: "Par de bocinas amplificadas sobre tripiés, modelo 3D",
  apilados:
    "Dos torres de tres bafles de line array apilados en el piso, modelo 3D",
  luces:
    "Pórtico de truss con cinco cabezas móviles y sus haces de luz, modelo 3D",
  circuito: "Tres pantallas LED conectadas por cable a un switcher, modelo 3D",
};

// Mensaje prellenado para WhatsApp, por formato.
const MESSAGES = {
  creativo: "Hola, me interesa la pantalla LED en formato creativo.",
  individual: "Hola, me interesa la pantalla LED individual.",
  curva: "Hola, me interesa la pantalla LED curva.",
  colgante: "Hola, me interesa la pantalla LED colgante.",
  ancha: "Hola, me interesa la pantalla LED ancha sobre tarima.",
  simetrico: "Hola, me interesa el muro LED simétrico con franja al frente.",
  lineArray: "Hola, me interesa el audio con line array en torres de truss.",
  bocinas: "Hola, me interesa el audio con bocinas en tripié.",
  apilados: "Hola, me interesa el audio con bafles apilados.",
  luces: "Hola, me interesa la iluminación con cabezas móviles.",
  circuito: "Hola, me interesa el circuito cerrado.",
};

const WHATSAPP = "https://wa.me/5216622288930";

// Nombre visible de cada formato.
const NAMES = {
  creativo: "Creativo",
  individual: "Individual",
  curva: "Curva",
  colgante: "Colgante",
  ancha: "Ancha sobre tarima",
  simetrico: "Simétrico con franja",
  lineArray: "Line array en torres",
  bocinas: "Bocinas en tripié",
  apilados: "Bafles apilados",
  luces: "Cabezas móviles en pórtico",
  circuito: "Circuito cerrado",
};

// Armado de los seis formatos LED de esta seccion, contado en modulos de
// pantalla: primero el ancho y luego el alto, que es como se cotiza y como
// se monta en sitio.
const SPECIFICATIONS: Partial<Record<Model, Specification[]>> = {
  creativo: [
    { label: "Cuerpo central", size: "4 × 2" },
    { label: "Torres laterales", size: "1 × 2" },
  ],
  individual: [{ label: "Pantalla frontal", size: "4 × 2" }],
  curva: [{ label: "Pantalla curva", size: "4 × 2" }],
  colgante: [
    { label: "Cubos colgantes", size: "2 × 2" },
    { label: "Pantalla de piso", size: "6 × 1" },
  ],
  ancha: [{ label: "Pantalla panorámica", size: "6 × 2" }],
  simetrico: [
    { label: "Cuerpo central", size: "4 × 2" },
    { label: "Torres laterales", size: "1 × 2" },
    { label: "Faldón de tarima", size: "6 × 1" },
  ],
};

type Props = {
  model: Model;
  /* Sin boton de contacto debajo. */
  withCta?: boolean;
  /* Lienzo apaisado en vez de vertical. */
  landscape?: boolean;
};

export function ScreenViewer({
  model,
  withCta = true,
  landscape = false,
}: Props) {
  const Scene = SCENES[model];
  const frame = useRef<HTMLDivElement>(null);
  const specificationsId = useId();
  const specifications = SPECIFICATIONS[model];
  // Refleja si el modelo deberia estar encendido, sin esperar al re-render.
  const live = useRef(false);
  // Aviso pendiente a la cola: se dispara cuando el lienzo ya esta pintado.
  const avisar = useRef<(() => void) | null>(null);
  // El modelo se descarga y se monta cuando el hueco esta por entrar en
  // pantalla; una pestana oculta no tiene tamano, asi que no se monta hasta
  // que el usuario la abre. Una vez montado, se queda.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let release: number | undefined;
    let cancelWarm: (() => void) | undefined;

    const mount = () => {
      window.clearTimeout(release);
      if (live.current) return;
      live.current = true;
      queueMount((listo) => {
        avisar.current = listo;
        setMounted(true);
      });
    };

    // Calentado: en cuanto el navegador tiene un hueco libre, los modelos de
    // la pestana abierta se arman aunque esten lejos, de uno en uno.
    const warmUp = () => {
      cancelWarm?.();
      if (live.current || isHidden(element)) return;
      cancelWarm = onIdle(() => {
        if (!isHidden(element)) mount();
      }, 1200);
    };

    // Si el hueco se acerca a la pantalla, no se espera al hueco libre.
    // En telefono se adelanta menos: con 1400px entraban media docena de
    // escenas a la cola a la vez y el hilo principal no daba abasto.
    const adelanto = window.innerWidth < 900 ? 700 : 1400;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) mount();
      },
      { rootMargin: `${adelanto}px 0px` },
    );
    observer.observe(element);

    // Abrir o cerrar la pestana cambia el tamano del hueco: al abrirla se
    // calienta, al cerrarla se suelta el contexto pasado el plazo.
    const resize = new ResizeObserver(() => {
      if (isHidden(element)) {
        cancelWarm?.();
        if (!live.current) return;
        release = window.setTimeout(() => {
          live.current = false;
          setMounted(false);
        }, RELEASE_DELAY);
        return;
      }
      window.clearTimeout(release);
      warmUp();
    });
    resize.observe(element);
    warmUp();

    return () => {
      window.clearTimeout(release);
      cancelWarm?.();
      observer.disconnect();
      resize.disconnect();
    };
  }, []);

  // La cola sigue cerrada hasta que este lienzo existe y ya pinto un par de
  // cuadros. Asi las escenas se encienden de una en una de verdad.
  useEffect(() => {
    if (!mounted) return;
    const element = frame.current;
    const listo = avisar.current;
    if (!element || !listo) return;
    avisar.current = null;

    let hecho = false;
    const avisarUnaVez = () => {
      if (hecho) return;
      hecho = true;
      observer.disconnect();
      window.clearTimeout(plazo);
      requestAnimationFrame(() => requestAnimationFrame(listo));
    };

    const observer = new MutationObserver(() => {
      if (element.querySelector("canvas")) avisarUnaVez();
    });
    const plazo = window.setTimeout(avisarUnaVez, 5000);

    if (element.querySelector("canvas")) {
      avisarUnaVez();
    } else {
      observer.observe(element, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
      window.clearTimeout(plazo);
      if (!hecho) listo();
    };
  }, [mounted]);

  // Descarga anticipada del codigo de la escena, sin bloquear la carga.
  useEffect(() => {
    if (mounted) return;
    return onIdle(() => {
      void IMPORTERS[model]();
    }, 2500);
  }, [model, mounted]);

  return (
    <div className={styles.viewer}>
      {specifications && (
        <div className={styles.specifications}>
          <button
            type="button"
            className={styles.infoButton}
            aria-label={`Ver especificaciones de ${NAMES[model]}`}
            aria-describedby={specificationsId}
          >
            <span aria-hidden="true">i</span>
          </button>
          <div
            id={specificationsId}
            role="tooltip"
            className={styles.specificationsPopover}
          >
            <p className={styles.specificationsTitle}>Especificaciones</p>
            <p className={styles.specificationsUnit}>Módulos · ancho × alto</p>
            <ul className={styles.specificationsList}>
              {specifications.map((specification) => (
                <li key={specification.label}>
                  <span>{specification.label}</span>
                  <strong>{specification.size}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <h2 className={styles.name}>{NAMES[model]}</h2>
      <div
        ref={frame}
        className={`${styles.canvas} ${landscape ? styles.landscape : ""}`}
        role="img"
        aria-label={LABELS[model]}
      >
        {mounted && <Scene />}
      </div>
      <p className={styles.hint}>Arrastra para girar · rueda para acercar</p>
      {withCta && (
        <a
          href={`${WHATSAPP}?text=${encodeURIComponent(MESSAGES[model])}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.cta}
        >
          <span>Me interesa</span>
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
      )}
    </div>
  );
}
