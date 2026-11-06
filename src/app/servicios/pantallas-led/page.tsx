import type { Metadata } from "next";
import { ServiceCard } from "@/components/sections/service-card";
import { ServiceHero } from "@/components/sections/service-hero";
import { ServiceInfo } from "@/components/sections/service-info";
import { ServiceSwitcher } from "@/components/sections/service-switcher";
import { SiteHeader } from "@/components/site-header";
import { ScreenViewer } from "@/components/three/screen-viewer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pantallas LED y Producción · PixelSaund",
  description:
    "Pantallas LED, audio, iluminación y circuito cerrado para eventos en Sonora.",
};

export default function PantallasLedPage() {
  return (
    <>
      <SiteHeader compact />
      <main id="contenido">
        <ServiceHero
          title="Pantallas LED y Producción"
          image={{
            src: "/images/servicios/pantallas-led-portada.jpg",
            alt: "Vista aérea de un evento con pantalla LED, truss y pista iluminada",
          }}
        />
        <div className={styles.body}>
          <ServiceSwitcher
            sections={[
              {
                id: "pantallas-led",
                label: "Pantallas LED",
                /* Tarjeta apaisada de entrada y, mas abajo, los modelos 3D
                   de los formatos en fila desde la izquierda. Textos
                   provisionales: los sustituye el usuario. */
                content: (
                  <>
                    <div className={styles.intro}>
                      <ServiceCard
                        variant="wide"
                        eyebrow="Pantallas LED"
                        title="Pantallas que se ven, se sienten"
                        accent="y se recuerdan."
                        description="Formatos creativos, curvos, colgantes y sobre tarima, con contenido en vivo y operación completa de nuestro equipo."
                        media={{
                          kind: "image",
                          src: "/images/servicios/pantallas-card.jpg",
                          alt: "Escenario con muro de pantallas LED y cabina de DJ iluminada",
                          sizes: "(max-width: 1100px) 100vw, 1100px",
                        }}
                      />
                    </div>
                    <div className={styles.stage}>
                      <ScreenViewer model="creativo" />
                      <ScreenViewer model="individual" />
                      <ScreenViewer model="curva" />
                      <ScreenViewer model="colgante" />
                      <ScreenViewer model="ancha" />
                      <ScreenViewer model="simetrico" />
                    </div>
                  </>
                ),
              },
              /* Los demas servicios se disenan despues; por ahora reservan
                 su espacio. */
              {
                id: "audio",
                label: "Audio",
                /* Tarjeta con video a la izquierda; los modelos a la
                   derecha. */
                content: (
                  <div className={styles.audio}>
                    <ServiceCard
                      variant="tall"
                      eyebrow="Audio profesional"
                      title="Sonido que se siente"
                      accent="en cada rincón."
                      description="Line array, bocinas amplificadas y bafles apilados, calibrados para tu recinto y operados por nuestro equipo."
                      media={{
                        kind: "image",
                        src: "/images/servicios/audio-card.jpg",
                        alt: "Line array de tres bafles colgado durante un montaje",
                        sizes: "(max-width: 1000px) 100vw, 420px",
                      }}
                    />
                    <div className={styles.audioModels}>
                      <ScreenViewer model="lineArray" withCta={false} />
                      <ScreenViewer model="bocinas" withCta={false} />
                      <ScreenViewer model="apilados" withCta={false} />
                    </div>
                  </div>
                ),
              },
              {
                id: "iluminacion",
                label: "Iluminación",
                /* Tarjeta partida pegada al borde izquierdo y, a su derecha,
                   el modelo de luces. */
                content: (
                  <div className={styles.lighting}>
                    <ServiceCard
                      variant="split"
                      eyebrow="Iluminación"
                      title="Luz que transforma"
                      accent="el ambiente."
                      description="Cabezas móviles, wash y ambientación arquitectónica, sincronizadas con tu programa y operadas por nuestro equipo."
                      media={{
                        kind: "video",
                        src: "/videos/servicios/iluminacion-card.mp4",
                        small: "/videos/servicios/iluminacion-card-720.mp4",
                        poster: "/images/servicios/iluminacion-card.jpg",
                      }}
                    />
                    <div className={styles.lightingModel}>
                      <ScreenViewer model="luces" withCta={false} />
                      {/* Textos provisionales: los sustituye el usuario. */}
                      <ServiceInfo
                        title="Luz que marca el ritmo del evento."
                        paragraphs={[
                          "Cabezas móviles, wash y ambientación programadas para cada momento: entrada, baile, show y cierre. Una sola persona las opera desde consola, en sincronía con el audio y las pantallas.",
                        ]}
                        items={[
                          {
                            term: "Cabezas móviles",
                            detail:
                              "Haces, gobos y colores en movimiento sobre pista y escenario.",
                          },
                          {
                            term: "Ambientación",
                            detail:
                              "Luz arquitectónica que tiñe paredes, mesas y jardín.",
                          },
                          {
                            term: "Operación en vivo",
                            detail:
                              "Programación por escenas y control durante todo el evento.",
                          },
                        ]}
                      />
                    </div>
                  </div>
                ),
              },
              {
                id: "circuito-cerrado",
                label: "Circuito cerrado",
                /* Tarjeta vertical a la izquierda; los modelos, cuando
                   existan, a la derecha. */
                content: (
                  <div className={styles.audio}>
                    <ServiceCard
                      variant="tall"
                      eyebrow="Circuito cerrado"
                      title="Que nadie se pierda"
                      accent="el momento."
                      description="Cámaras en vivo, switcher y operador para llevar cada instante a las pantallas y grabar tu evento."
                      media={{
                        kind: "image",
                        src: "/images/servicios/circuito-card.jpg",
                        alt: "Operador de circuito cerrado frente al monitor multivista durante una graduación",
                        sizes: "(max-width: 1000px) 100vw, 420px",
                      }}
                    />
                    <div className={styles.circuitModel}>
                      <ScreenViewer
                        model="circuito"
                        withCta={false}
                        landscape
                      />
                      {/* Textos provisionales: los sustituye el usuario. */}
                      <ServiceInfo
                        title="Lo que pasa en el escenario, en todas las pantallas."
                        paragraphs={[
                          "Colocamos cámaras en los puntos clave del evento y enviamos su señal en vivo a un switcher. Desde ahí elegimos la mejor toma y la mandamos a las pantallas LED, para que cada invitado vea de cerca lo que ocurre, esté donde esté.",
                          "Funciona para graduaciones, conferencias, bodas y conciertos: el primer plano del orador, del brindis o del artista, en el momento exacto.",
                        ]}
                        items={[
                          {
                            term: "Cámaras en vivo",
                            detail:
                              "Fijas o con operador, según el tamaño y el ritmo del evento.",
                          },
                          {
                            term: "Switcher y realización",
                            detail:
                              "Cambio de toma en tiempo real, con gráficos y logotipos sobre la imagen.",
                          },
                          {
                            term: "Señal a pantallas",
                            detail:
                              "Salida a todas las pantallas del montaje, sincronizadas entre sí.",
                          },
                          {
                            term: "Grabación",
                            detail:
                              "Te entregamos el video del evento tal como se vio en pantalla.",
                          },
                        ]}
                      />
                    </div>
                  </div>
                ),
              },
            ]}
          />
          {/* Aire al pie de cada seccion. */}
          <div className={styles.tail} />
        </div>
      </main>
    </>
  );
}
