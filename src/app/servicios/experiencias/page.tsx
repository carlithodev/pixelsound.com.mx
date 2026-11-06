import type { Metadata } from "next";
import { ServiceFeature } from "@/components/sections/service-feature";
import { ServiceCta } from "@/components/sections/service-cta";
import { ServiceHero } from "@/components/sections/service-hero";
import { ServiceStatement } from "@/components/sections/service-statement";
import { ServiceSwitcher } from "@/components/sections/service-switcher";
import { SiteHeader } from "@/components/site-header";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Experiencias · PixelSaund",
  description:
    "Plataforma 360, cabina Vogue, foto espejo, alfombra roja y letras iluminadas para eventos en Sonora.",
};

export default function ExperienciasPage() {
  return (
    <>
      <SiteHeader compact />
      <main id="contenido">
        <ServiceHero
          title="Experiencias"
          image={{
            src: "/images/servicios/experiencias-banner.jpg",
            alt: "Alfombra roja con postes dorados y cordón a la entrada de un salón",
            // El encuadre se ancla arriba: entra mas fondo y menos piso.
            position: "center 22%",
          }}
        />
        <div className={styles.body}>
          <ServiceSwitcher
            sections={[
              {
                id: "entradas-de-bienvenida",
                label: "Entradas de bienvenida",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceStatement
                      eyebrow="Entradas de bienvenida"
                      title="El evento comienza desde"
                      accent="la llegada."
                      lead="Un recorrido visual para recibir a tus invitados y marcar el inicio de la celebración."
                      media={{
                        kind: "video",
                        src: "/videos/experiencias/entradas-bienvenida-2.mp4",
                        small:
                          "/videos/experiencias/entradas-bienvenida-2-720.mp4",
                        poster:
                          "/images/experiencias/entradas-bienvenida-2-poster.jpg",
                      }}
                      ratio="16 / 9"
                      width="min(920px, 100%)"
                    />
                    <ServiceFeature
                      side="left"
                      title="Una bienvenida que"
                      accent="prepara el momento."
                      paragraphs={[
                        "La iluminación, los detalles y el montaje se integran a la llegada de cada invitado.",
                      ]}
                      media={{
                        kind: "video",
                        src: "/videos/experiencias/entradas-bienvenida-1.mp4",
                        small:
                          "/videos/experiencias/entradas-bienvenida-1-720.mp4",
                        poster:
                          "/images/experiencias/entradas-bienvenida-1-poster.jpg",
                      }}
                      ratio="16 / 9"
                    />
                    <ServiceCta message="Hola, me interesan las entradas de bienvenida para mi evento." />
                  </div>
                ),
              },
              {
                id: "alfombra-roja",
                label: "Alfombra roja",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="right"
                      ratio="9 / 16"
                      eyebrow="Alfombra roja"
                      title="La entrada que se"
                      accent="hace esperar."
                      paragraphs={[
                        "Alfombra a la medida de tu acceso, postes dorados y cordón de terciopelo. Montada y retirada por nuestro equipo.",
                      ]}
                      media={[
                        {
                          kind: "video",
                          src: "/videos/experiencias/alfombra-roja.mp4",
                          small: "/videos/experiencias/alfombra-roja-720.mp4",
                          poster:
                            "/images/experiencias/alfombra-roja-poster.jpg",
                        },
                        {
                          kind: "video",
                          src: "/videos/experiencias/alfombra-roja-2.mp4",
                          small: "/videos/experiencias/alfombra-roja-2-720.mp4",
                          poster:
                            "/images/experiencias/alfombra-roja-2-poster.jpg",
                        },
                      ]}
                    />
                    <ServiceFeature
                      side="left"
                      bare
                      title="Para que tus invitados entren"
                      accent="con elegancia."
                      paragraphs={[
                        "El pasillo marca por dónde se camina y dónde se posa para la foto: cordón a los costados, alfombra limpia y el espacio libre de cables.",
                        "Se adapta al largo de tu entrada y combina con las letras iluminadas y el túnel de bienvenida.",
                      ]}
                      media={{
                        kind: "image",
                        src: "/images/experiencias/alfombra-roja.png",
                        alt: "Alfombra roja entre postes dorados con cordón de terciopelo",
                        sizes: "(max-width: 860px) 100vw, 46vw",
                      }}
                    />
                    <ServiceCta message="Hola, me interesa la alfombra roja para mi evento." />
                  </div>
                ),
              },
              {
                id: "plataforma-360",
                label: "Plataforma 360",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceStatement
                      eyebrow="Plataforma 360"
                      title="Una vuelta y"
                      accent="ya es el video del día."
                      lead="Tus invitados se suben, la cámara gira a su alrededor y se llevan el clip listo para subir."
                      media={{
                        kind: "video",
                        src: "/videos/experiencias/plataforma-360.mp4",
                        small: "/videos/experiencias/plataforma-360-720.mp4",
                        poster:
                          "/images/experiencias/plataforma-360-poster.jpg",
                      }}
                      ratio="1 / 1"
                      width="min(620px, 100%)"
                    />
                    <ServiceFeature
                      side="left"
                      title="Un montaje que no estorba"
                      accent="y se ve en todas partes."
                      paragraphs={[
                        "La plataforma se coloca donde pasa la fiesta: pista, jardín o entrada. Va con aro de luz, barandal y una persona del equipo guiando cada toma.",
                        "El video sale al momento por WhatsApp o código QR, con la música que elijas.",
                      ]}
                      media={{
                        kind: "image",
                        src: "/images/experiencias/plataforma-360-foto.jpg",
                        alt: "Invitados de una graduación grabando en la plataforma 360",
                        sizes: "(max-width: 860px) 100vw, 46vw",
                      }}
                      ratio="16 / 15"
                    />
                    <ServiceCta message="Hola, me interesa la plataforma 360 para mi evento." />
                  </div>
                ),
              },
              {
                id: "cabina-revista-vogue",
                label: "Cabina revista Vogue",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="right"
                      ratio="9 / 16"
                      height="clamp(540px, 78vh, 720px)"
                      eyebrow="Cabina revista Vogue"
                      title="Una portada creada"
                      accent="para tus invitados."
                      paragraphs={[
                        "Una cabina inspirada en una revista para convertir cada foto en parte de la experiencia.",
                      ]}
                      media={[
                        {
                          kind: "video",
                          src: "/videos/experiencias/cabina-vogue-1.mp4",
                          small: "/videos/experiencias/cabina-vogue-1-720.mp4",
                          poster:
                            "/images/experiencias/cabina-vogue-1-poster.jpg",
                        },
                        {
                          kind: "video",
                          src: "/videos/experiencias/cabina-vogue-2.mp4",
                          small: "/videos/experiencias/cabina-vogue-2-720.mp4",
                          poster:
                            "/images/experiencias/cabina-vogue-2-poster.jpg",
                        },
                      ]}
                    />
                    <ServiceCta message="Hola, me interesa la cabina revista Vogue para mi evento." />
                  </div>
                ),
              },
              {
                id: "foto-espejo",
                label: "Foto espejo",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="left"
                      ratio="9 / 16"
                      height="clamp(540px, 78vh, 720px)"
                      eyebrow="Foto espejo"
                      title="Un reflejo para"
                      accent="guardar el momento."
                      paragraphs={[
                        "El espejo recibe a tus invitados para que se lleven una foto de la celebración.",
                      ]}
                      media={[
                        {
                          kind: "video",
                          src: "/videos/experiencias/foto-espejo.mp4",
                          small: "/videos/experiencias/foto-espejo-720.mp4",
                          poster: "/images/experiencias/foto-espejo-poster.jpg",
                        },
                        {
                          kind: "image",
                          src: "/images/experiencias/foto-espejo.jpg",
                          alt: "Invitada frente al espejo de fotografías durante un evento",
                          sizes: "(max-width: 860px) 50vw, 24vw",
                        },
                      ]}
                    />
                    <ServiceCta message="Hola, me interesa la foto espejo para mi evento." />
                  </div>
                ),
              },
              {
                id: "letras-iluminadas",
                label: "Letras iluminadas",
                /* Textos provisionales: los sustituye el usuario. */
                content: (
                  <div className={styles.section}>
                    <ServiceFeature
                      side="right"
                      ratio="1 / 1"
                      eyebrow="Letras iluminadas"
                      title="El nombre del festejado,"
                      accent="en grande."
                      paragraphs={[
                        "Letras de casi dos metros con foco a la vista. Se arman donde tú digas y aguantan de día y de noche.",
                      ]}
                      media={{
                        kind: "image",
                        src: "/images/experiencias/letras-iluminadas-foto.jpg",
                        alt: "Letras iluminadas blancas montadas en el patio de un salón",
                        sizes: "(max-width: 860px) 100vw, 46vw",
                      }}
                    />
                    <ServiceFeature
                      side="left"
                      ratio="9 / 16"
                      height="clamp(540px, 92vh, 900px)"
                      title="De noche se roban"
                      accent="todas las fotos."
                      paragraphs={[
                        "Los focos encienden en cuanto baja el sol y marcan el punto donde todos se van a retratar.",
                        "Combinan con la alfombra roja y la entrada de bienvenida para armar un solo recorrido.",
                      ]}
                      media={{
                        kind: "video",
                        src: "/videos/experiencias/letras-iluminadas.mp4",
                        small: "/videos/experiencias/letras-iluminadas-720.mp4",
                        poster:
                          "/images/experiencias/letras-iluminadas-poster.jpg",
                      }}
                    />
                    <ServiceCta message="Hola, me interesan las letras iluminadas para mi evento." />
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
