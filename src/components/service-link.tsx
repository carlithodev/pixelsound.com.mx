"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  /* Aviso al menu que lo contiene, para que se cierre al elegir destino. */
  onNavigate?: () => void;
};

// El sitio se publica con barra final (trailingSlash), asi que usePathname
// devuelve "/servicios/x/" mientras que las direcciones del catalogo son
// "/servicios/x#apartado". Sin igualar la barra, la comparacion fallaba
// siempre y el atajo de abajo nunca corria.
const sinBarra = (ruta: string) => ruta.replace(/\/+$/, "") || "/";

// Enlace a un apartado. Si ya estamos en esa pagina, cambia la direccion y
// avisa para que la pildora se mueva, sin recargar nada. Hace falta avisar a
// mano: el router de Next cambia la direccion con history.pushState, y eso
// no dispara el "hashchange" que escucha el selector de apartados.
export function ServiceLink({ href, className, children, onNavigate }: Props) {
  const pathname = usePathname();
  const [path, hash] = href.split("#");
  const samePage = Boolean(hash) && sinBarra(path) === sinBarra(pathname);

  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        onNavigate?.();
        if (!samePage) return;
        event.preventDefault();
        if (window.location.hash !== `#${hash}`) {
          window.history.pushState(null, "", `#${hash}`);
        }
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }}
    >
      {children}
    </Link>
  );
}
