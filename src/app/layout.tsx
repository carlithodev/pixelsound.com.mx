import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site-footer";
import { SocialDock } from "@/components/social-dock";
import "./globals.css";

// Fuente base del sitio: titulos, navegacion y controles la heredan.
const manrope = localFont({
  src: "../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  display: "swap",
  weight: "200 800",
  variable: "--font-manrope",
});

// Fuente de lectura: parrafos y descripciones la toman por su variable.
const montserrat = localFont({
  src: "../../node_modules/@fontsource-variable/montserrat/files/montserrat-latin-wght-normal.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-montserrat",
});

// Fuente de titular: Inter Tight, la version abierta mas cercana a la
// tipografia de Apple. Solo el hero la usa.
const interTight = localFont({
  src: "../../node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--font-inter-tight",
});

export const metadata: Metadata = {
  title: "PixelSaund",
  description: "Conoce los servicios de PixelSaund.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${manrope.variable} ${montserrat.variable} ${interTight.variable}`}
    >
      <head>
        {/* El primer cuadro del hero: se pide desde el arranque para que la
            portada no pase por negro. */}
        <link
          rel="preload"
          as="image"
          href="/images/hero-banner-poster.jpg"
          fetchPriority="high"
        />
      </head>
      <body>
        {children}
        <SiteFooter />
        <SocialDock />
      </body>
    </html>
  );
}
