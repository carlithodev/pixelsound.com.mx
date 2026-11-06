/* Mapa unico de servicios: lo usan el menu del encabezado y el pie, y de ahi
   salen las direcciones de cada apartado. Cambiar aqui cambia los dos. */

export type ServiceItem = {
  label: string;
  href: string;
};

export type ServiceGroup = {
  /* Nombre corto, para el pie. */
  short: string;
  /* Nombre completo del modulo, para el menu. */
  title: string;
  href: string;
  items: ServiceItem[];
};

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    short: "Pantallas y personalización",
    title: "Pantallas LED y Producción",
    href: "/servicios/pantallas-led",
    items: [
      {
        label: "Pantallas LED",
        href: "/servicios/pantallas-led#pantallas-led",
      },
      { label: "Audio", href: "/servicios/pantallas-led#audio" },
      { label: "Iluminación", href: "/servicios/pantallas-led#iluminacion" },
      {
        label: "Circuito cerrado",
        href: "/servicios/pantallas-led#circuito-cerrado",
      },
    ],
  },
  {
    short: "Experiencias",
    title: "Experiencias",
    href: "/servicios/experiencias",
    items: [
      {
        label: "Entradas de bienvenida",
        href: "/servicios/experiencias#entradas-de-bienvenida",
      },
      { label: "Alfombra roja", href: "/servicios/experiencias#alfombra-roja" },
      {
        label: "Plataforma 360",
        href: "/servicios/experiencias#plataforma-360",
      },
      {
        label: "Cabina revista Vogue",
        href: "/servicios/experiencias#cabina-revista-vogue",
      },
      { label: "Foto espejo", href: "/servicios/experiencias#foto-espejo" },
      {
        label: "Letras iluminadas",
        href: "/servicios/experiencias#letras-iluminadas",
      },
    ],
  },
  {
    short: "Animación y show",
    title: "Animación y Show",
    href: "/servicios/animacion-y-show",
    items: [
      {
        label: "DJ PixelSound",
        href: "/servicios/animacion-y-show#dj-pixelsound",
      },
      { label: "Robots LED", href: "/servicios/animacion-y-show#robots-led" },
      { label: "Batucada", href: "/servicios/animacion-y-show#batucada" },
      { label: "Chisperos", href: "/servicios/animacion-y-show#chisperos" },
    ],
  },
];
