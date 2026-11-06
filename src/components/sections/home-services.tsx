import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { BLUR } from "./carrusel-blur";
import { ServiceTrack } from "./service-track";
import styles from "./home-services.module.css";

type Item = {
  label: string;
  /* Nombre del archivo en /images/servicios/carrusel. */
  imagen: string;
  href: string;
};

type Grupo = {
  id: string;
  titulo: string;
  descripcion: string;
  href: string;
  items: Item[];
};

// Los mismos apartados que lista el pie de pagina, con su foto.
// Descripciones provisionales: las sustituye el usuario.
const GRUPOS: Grupo[] = [
  {
    id: "pantallas-led",
    titulo: "Pantallas LED y Producción",
    descripcion:
      "Pantallas de alta resolución, audio, iluminación y circuito cerrado: el montaje técnico completo de tu evento.",
    href: "/servicios/pantallas-led",
    items: [
      {
        label: "Pantallas LED",
        imagen: "pantallas-led",
        href: "/servicios/pantallas-led#pantallas-led",
      },
      {
        label: "Audio",
        imagen: "audio",
        href: "/servicios/pantallas-led#audio",
      },
      {
        label: "Iluminación",
        imagen: "iluminacion",
        href: "/servicios/pantallas-led#iluminacion",
      },
      {
        label: "Circuito cerrado",
        imagen: "circuito-cerrado",
        href: "/servicios/pantallas-led#circuito-cerrado",
      },
    ],
  },
  {
    id: "experiencias",
    titulo: "Experiencias",
    descripcion:
      "Alfombra roja, plataforma 360, foto espejo y activaciones que convierten a tus invitados en los protagonistas.",
    href: "/servicios/experiencias",
    items: [
      {
        label: "Entradas de bienvenida",
        imagen: "entradas-bienvenida",
        href: "/servicios/experiencias#entradas-de-bienvenida",
      },
      {
        label: "Alfombra roja",
        imagen: "alfombra-roja",
        href: "/servicios/experiencias#alfombra-roja",
      },
      {
        label: "Plataforma 360",
        imagen: "plataforma-360",
        href: "/servicios/experiencias#plataforma-360",
      },
      {
        label: "Cabina revista Vogue",
        imagen: "cabina-vogue",
        href: "/servicios/experiencias#cabina-revista-vogue",
      },
      {
        label: "Foto espejo",
        imagen: "foto-espejo",
        href: "/servicios/experiencias#foto-espejo",
      },
      {
        label: "Letras iluminadas",
        imagen: "letras-iluminadas",
        href: "/servicios/experiencias#letras-iluminadas",
      },
    ],
  },
  {
    id: "animacion-y-show",
    titulo: "Animación y Show",
    descripcion:
      "DJ, robots LED, batucada y chisperos para levantar la pista en el momento exacto.",
    href: "/servicios/animacion-y-show",
    items: [
      {
        label: "DJ PixelSound",
        imagen: "dj-pixelsound",
        href: "/servicios/animacion-y-show#dj-pixelsound",
      },
      {
        label: "Robots LED",
        imagen: "robot-led",
        href: "/servicios/animacion-y-show#robots-led",
      },
      {
        label: "Batucada",
        imagen: "batucada",
        href: "/servicios/animacion-y-show#batucada",
      },
      {
        label: "Chisperos",
        imagen: "chisperos",
        href: "/servicios/animacion-y-show#chisperos",
      },
    ],
  },
];

// Ritmo parejo en las tres pistas: mismo tiempo por tarjeta, aunque un grupo
// tenga mas apartados que otro.
const SEGUNDOS_POR_TARJETA = 8.5;
// Ancho maximo de tarjeta mas su hueco, y la pantalla mas ancha que queremos
// cubrir. Con pocas copias, en monitores anchos la pista se quedaba corta a
// mitad del bucle y se abria un hueco.
const ANCHO_TARJETA = 328;
const PANTALLA_ANCHA = 2560;

// La pista se desplaza la mitad de su ancho: esa mitad tiene que tapar la
// ventana entera, asi que se repite la fila las veces que haga falta.
const copiasDe = (items: number) => {
  const porMitad = Math.max(
    2,
    Math.ceil(PANTALLA_ANCHA / (items * ANCHO_TARJETA)),
  );
  return Array.from({ length: porMitad * 2 }, (_, i) =>
    i === 0 ? "original" : `eco-${i}`,
  );
};

function Fila({ items, oculta }: { items: Item[]; oculta?: boolean }) {
  return (
    <ul className={styles.fila} aria-hidden={oculta}>
      {items.map((item) => (
        <li key={item.imagen} className={styles.celda}>
          <Link
            className={styles.card}
            href={item.href}
            tabIndex={oculta ? -1 : undefined}
          >
            <Image
              className={styles.foto}
              src={`/images/servicios/carrusel/${item.imagen}.jpg`}
              alt={oculta ? "" : item.label}
              width={720}
              height={1280}
              sizes="(max-width: 760px) 62vw, 310px"
              quality={78}
              // Miniatura borrosa mientras baja la foto: sin esto la tarjeta
              // entra al carrusel como un recuadro negro.
              placeholder="blur"
              blurDataURL={BLUR[item.imagen]}
            />
            <span className={styles.velo} />
            <span className={styles.etiqueta}>{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeServices() {
  return (
    <section
      id="servicios"
      className={styles.services}
      aria-labelledby="servicios-title"
    >
      <Reveal className={styles.block}>
        <h2 id="servicios-title" className={styles.heading}>
          Conoce nuestros <span className={styles.accent}>servicios</span>
        </h2>

        {GRUPOS.map((grupo) => (
          <article key={grupo.id} className={styles.grupo}>
            <header className={styles.encabezado}>
              <h3 className={styles.titulo}>{grupo.titulo}</h3>
              <p className={styles.descripcion}>{grupo.descripcion}</p>
            </header>

            {/* Filas identicas: la pista se desplaza la mitad de su ancho y el
                bucle empalma sin salto. Solo la primera cuenta para lectores
                de pantalla. */}
            <ServiceTrack
              titulo={grupo.titulo}
              paso={SEGUNDOS_POR_TARJETA}
              duracion={
                (copiasDe(grupo.items.length).length / 2) *
                grupo.items.length *
                SEGUNDOS_POR_TARJETA
              }
            >
              {copiasDe(grupo.items.length).map((copia) => (
                <Fila
                  key={copia}
                  items={grupo.items}
                  oculta={copia !== "original"}
                />
              ))}
            </ServiceTrack>

            <Link className={styles.mas} href={grupo.href}>
              Más detalles
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
            </Link>
          </article>
        ))}
      </Reveal>
    </section>
  );
}
