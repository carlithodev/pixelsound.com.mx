import Image from "next/image";
import { Reveal } from "@/components/reveal";
import styles from "./home-clients.module.css";

type Client = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

const CLIENTS: Client[] = [
  {
    src: "/images/clientes/cobach.png",
    alt: "Colegio de Bachilleres del Estado de Sonora",
    width: 400,
    height: 200,
  },
  {
    src: "/images/clientes/unison.png",
    alt: "Universidad de Sonora",
    width: 200,
    height: 200,
  },
  {
    src: "/images/clientes/kino.png",
    alt: "Universidad Kino",
    width: 300,
    height: 200,
  },
  {
    src: "/images/clientes/normal-sonora.png",
    alt: "Escuela Normal del Estado de Sonora",
    width: 198,
    height: 200,
  },
  {
    src: "/images/clientes/deluxe.png",
    alt: "Deluxe",
    width: 200,
    height: 200,
  },
];

function LogoRow({ hidden }: { hidden?: boolean }) {
  return (
    <ul className={styles.row} aria-hidden={hidden}>
      {CLIENTS.map((client) => (
        <li key={client.src} className={styles.item}>
          <Image
            src={client.src}
            alt={hidden ? "" : client.alt}
            width={client.width}
            height={client.height}
            quality={90}
            className={styles.logo}
          />
        </li>
      ))}
    </ul>
  );
}

export function HomeClients() {
  return (
    <section
      id="clientes"
      className={styles.clients}
      aria-labelledby="clientes-title"
    >
      <Reveal className={styles.inner}>
        <h2 id="clientes-title" className={styles.title}>
          Han confiado en nosotros
        </h2>
        {/* Dos filas identicas: la pista se desplaza la mitad de su ancho y el
            bucle empalma sin salto. La segunda fila es solo visual. */}
        <div className={styles.marquee}>
          <div className={styles.track}>
            <LogoRow />
            <LogoRow hidden />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
