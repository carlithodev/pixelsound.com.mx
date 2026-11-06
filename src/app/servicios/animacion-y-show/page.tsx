import type { Metadata } from "next";
import { ServiceCta } from "@/components/sections/service-cta";
import { ServiceFeature } from "@/components/sections/service-feature";
import { ServiceHero } from "@/components/sections/service-hero";
import { ServiceStatement } from "@/components/sections/service-statement";
import { ServiceSwitcher } from "@/components/sections/service-switcher";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Animación y Show · PixelSaund",
  description:
    "DJ PixelSound, robots LED, batucada y chisperos para eventos en Sonora.",
};

export default function AnimacionYShowPage() {
  return (
    <>
      <SiteHeader compact />
      <main id="contenido">
        <ServiceHero
          title="Animación y Show"
          image={{
            src: "/images/servicios/show-banner.jpg",
            alt: "Robot LED y botarga animando la pista de un evento",
          }}
        />
        <div className={styles.body}>
          <ServiceSwitcher
            sections={[
              {
                id: "dj-pixelsound",
                label: "DJ PixelSound",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="right"
                      ratio="9 / 16"
                      height="clamp(600px, 82vh, 880px)"
                      eyebrow="DJ PixelSound"
                      title="La música que mueve"
                      accent="cada momento."
                      paragraphs={[
                        "DJ PixelSound acompaña el ritmo de tu evento desde la primera canción hasta el cierre.",
                      ]}
                      media={{
                        kind: "video",
                        src: "/videos/animacion-y-show/dj-pixelsound-1.mp4",
                        small:
                          "/videos/animacion-y-show/dj-pixelsound-1-720.mp4",
                        poster:
                          "/images/animacion-y-show/dj-pixelsound-1-poster.jpg",
                      }}
                    />
                    <ServiceStatement
                      title="Una pista con"
                      accent="su propia energía."
                      lead="Una selección de música para que la celebración no pierda el ritmo."
                      media={{
                        kind: "video",
                        src: "/videos/animacion-y-show/dj-pixelsound-2.mp4",
                        small:
                          "/videos/animacion-y-show/dj-pixelsound-2-720.mp4",
                        poster:
                          "/images/animacion-y-show/dj-pixelsound-2-poster.jpg",
                      }}
                      ratio="16 / 9"
                      width="min(900px, 100%)"
                    />
                    <ServiceCta message="Hola, me interesa DJ PixelSound para mi evento." />
                  </div>
                ),
              },
              {
                id: "robots-led",
                label: "Robots LED",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceStatement
                      eyebrow="Robots LED"
                      title="Luz que entra"
                      accent="a la pista."
                      lead="Una intervención visual para activar la celebración y reunir a los invitados."
                      media={{
                        kind: "video",
                        src: "/videos/animacion-y-show/robots-led.mp4",
                        small: "/videos/animacion-y-show/robots-led-720.mp4",
                        poster:
                          "/images/animacion-y-show/robots-led-poster.jpg",
                      }}
                      ratio="16 / 9"
                      width="min(920px, 100%)"
                    />
                    <ServiceCta message="Hola, me interesan los robots LED para mi evento." />
                  </div>
                ),
              },
              {
                id: "batucada",
                label: "Batucada",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="left"
                      ratio="16 / 9"
                      eyebrow="Batucada"
                      title="El ritmo se"
                      accent="siente en vivo."
                      paragraphs={[
                        "Una entrada con percusión para levantar la energía de la celebración.",
                      ]}
                      media={{
                        kind: "video",
                        src: "/videos/animacion-y-show/batucada.mp4",
                        small: "/videos/animacion-y-show/batucada-720.mp4",
                        poster: "/images/animacion-y-show/batucada-poster.jpg",
                      }}
                    />
                    <ServiceCta message="Hola, me interesa la batucada para mi evento." />
                  </div>
                ),
              },
              {
                id: "chisperos",
                label: "Chisperos",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="right"
                      ratio="9 / 16"
                      height="clamp(600px, 82vh, 880px)"
                      eyebrow="Chisperos"
                      title="El instante que"
                      accent="enciende la celebración."
                      paragraphs={[
                        "Chisperos de luz fría para marcar entradas, brindis y momentos especiales.",
                      ]}
                      media={{
                        kind: "video",
                        src: "/videos/animacion-y-show/chisperos.mp4",
                        small: "/videos/animacion-y-show/chisperos-720.mp4",
                        poster: "/images/animacion-y-show/chisperos-poster.jpg",
                      }}
                    />
                    <ServiceCta message="Hola, me interesan los chisperos para mi evento." />
                  </div>
                ),
              },
            ]}
          />
          <div className={styles.tail} />
        </div>
      </main>
    </>
  );
}
