import type { CSSProperties } from "react";
import styles from "./pixel-field.module.css";

// Cuadritos del logo flotando por el lienzo oscuro. La lista es fija, nada de
// aleatorio: el servidor y el navegador tienen que pintar lo mismo. x/y en %
// del lienzo, size en px, dx/dy el viaje de ida y vuelta, dur la duracion y
// delay el desfase para que ninguno vaya a la par. El segundo punto del
// recorrido sale del primero girado, asi el camino es un triangulo y no un
// vaiven.
type Pixel = {
  x: number;
  y: number;
  size: number;
  tone: "violeta" | "magenta" | "coral" | "ambar" | "oro";
  alpha: number;
  dx: number;
  dy: number;
  dur: number;
  delay: number;
};

// Dieciseis: con mas, el movimiento obliga al navegador a repintar de mas y
// el efecto se lee igual.
const PIXELS: Pixel[] = [
  {
    x: 6,
    y: 4,
    size: 14,
    tone: "violeta",
    alpha: 30,
    dx: 78,
    dy: 102,
    dur: 14,
    delay: -3,
  },
  {
    x: 11,
    y: 8,
    size: 8,
    tone: "magenta",
    alpha: 25,
    dx: -54,
    dy: 72,
    dur: 18,
    delay: -11,
  },
  {
    x: 88,
    y: 3,
    size: 16,
    tone: "violeta",
    alpha: 29,
    dx: -90,
    dy: 78,
    dur: 16,
    delay: -17,
  },
  {
    x: 3,
    y: 17,
    size: 10,
    tone: "coral",
    alpha: 21,
    dx: 90,
    dy: -66,
    dur: 17,
    delay: -9,
  },
  {
    x: 96,
    y: 21,
    size: 13,
    tone: "violeta",
    alpha: 25,
    dx: -78,
    dy: 96,
    dur: 15,
    delay: -14,
  },
  {
    x: 8,
    y: 27,
    size: 17,
    tone: "magenta",
    alpha: 27,
    dx: 66,
    dy: 84,
    dur: 19,
    delay: -2,
  },
  {
    x: 91,
    y: 31,
    size: 8,
    tone: "oro",
    alpha: 21,
    dx: -72,
    dy: -78,
    dur: 17,
    delay: -19,
  },
  {
    x: 78,
    y: 38,
    size: 14,
    tone: "coral",
    alpha: 23,
    dx: 78,
    dy: -90,
    dur: 20,
    delay: -25,
  },
  {
    x: 4,
    y: 44,
    size: 9,
    tone: "magenta",
    alpha: 25,
    dx: 96,
    dy: 72,
    dur: 15,
    delay: -13,
  },
  {
    x: 97,
    y: 47,
    size: 15,
    tone: "violeta",
    alpha: 27,
    dx: -66,
    dy: -102,
    dur: 14,
    delay: -4,
  },
  {
    x: 12,
    y: 53,
    size: 12,
    tone: "ambar",
    alpha: 21,
    dx: 60,
    dy: -78,
    dur: 18,
    delay: -16,
  },
  {
    x: 2,
    y: 62,
    size: 16,
    tone: "violeta",
    alpha: 25,
    dx: 84,
    dy: 90,
    dur: 20,
    delay: -8,
  },
  {
    x: 93,
    y: 66,
    size: 8,
    tone: "coral",
    alpha: 23,
    dx: -54,
    dy: -72,
    dur: 12,
    delay: -18,
  },
  {
    x: 80,
    y: 74,
    size: 11,
    tone: "oro",
    alpha: 21,
    dx: -78,
    dy: 78,
    dur: 14,
    delay: -23,
  },
  {
    x: 95,
    y: 86,
    size: 14,
    tone: "magenta",
    alpha: 25,
    dx: -72,
    dy: -90,
    dur: 15,
    delay: -1,
  },
  {
    x: 16,
    y: 91,
    size: 10,
    tone: "coral",
    alpha: 21,
    dx: 66,
    dy: -72,
    dur: 18,
    delay: -20,
  },
];

export function PixelField() {
  return (
    <div className={styles.field} aria-hidden="true">
      {PIXELS.map((pixel) => (
        <span
          key={`${pixel.x}-${pixel.y}`}
          className={styles.pixel}
          style={
            {
              "--x": `${pixel.x}%`,
              "--y": `${pixel.y}%`,
              "--size": `${pixel.size}px`,
              "--color": `rgb(var(--${pixel.tone}) / ${pixel.alpha}%)`,
              "--dx": `${pixel.dx}px`,
              "--dy": `${pixel.dy}px`,
              "--dx2": `${Math.round(-pixel.dy * 0.7)}px`,
              "--dy2": `${Math.round(pixel.dx * 0.5)}px`,
              "--rot": `${pixel.dx > 0 ? 8 : -8}deg`,
              "--dur": `${pixel.dur}s`,
              "--delay": `${pixel.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
