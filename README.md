<p align="center">
  <img src="public/images/logopixelsaund.png" alt="PixelSaund Logo" width="180">
</p>



# PixelSaund

Landing page de servicios con Next.js (App Router), React, Tailwind CSS y TypeScript. Las pantallas 3D usan Three.js con @react-three/fiber y @react-three/drei. Se publica como sitio estático en hosting Apache de VacaWeb. La cabecera y la primera sección están implementadas a partir del primer boceto de Canva, con el logo y la fotografía proporcionados por el usuario.

La navegación a Nosotros y Eventos y el acceso al catálogo están deshabilitados hasta construir esas secciones. El logo PNG original y la navegación se superponen a la fotografía sobre un degradado negro superior; la imagen llega al borde superior de la página. Los tres puntos inferiores se retiraron por indicación del usuario. WhatsApp queda pendiente.

## Desarrollo local

Usar Node.js 24 y npm. Las versiones instaladas quedan fijadas en `package.json` y `package-lock.json`.

```bash
npm ci
npm run dev
```

Abrir http://localhost:3000. En esta computadora, las dependencias ya instaladas permiten comenzar directamente con `npm run dev`.

| Comando          | Propósito                                                |
| ---------------- | -------------------------------------------------------- |
| `npm run dev`    | Servidor de desarrollo con actualización al guardar      |
| `npm run check`  | Biome, comprobación de tipos y formato                   |
| `npm run format` | Aplicar formato con Prettier                             |
| `npm run build`  | Compilar para producción                                 |
| `npm start`      | Servir la compilación de producción localmente           |
| `npm audit`      | Consultar vulnerabilidades conocidas de las dependencias |

## Organización

Biome revisa las reglas de código de React y Next.js; TypeScript comprueba los tipos y Prettier administra el formato.

```text
src/app/                  Página principal, layout, estilos y metadatos
src/components/sections/  Una pieza por sección de la landing
src/components/ui/        Elementos visuales reutilizables cuando se necesiten
public/images/            Imágenes seleccionadas y optimizadas
public/videos/            Videos seleccionados y optimizados
public/fonts/             Tipografías locales autorizadas
assets/                   Material original de referencia, conservado localmente
```

`assets/` queda excluido de Git y de las subidas con Vercel CLI para evitar publicar originales y videos pesados. Los archivos originales no se mueven ni se borran; requieren su propio respaldo. Copiar a `public/` únicamente las versiones que vaya a utilizar la página. Todo archivo en `public/` será público.

## Acuerdo de diseño

- Reproducir las capturas de Canva al tamaño de referencia, respetando contenido, fuentes, colores, proporciones y espacios.
- Trabajar por secciones y ajustar con las indicaciones del usuario.
- Adaptar escritorio, tablet y móvil; usar el boceto móvil cuando se proporcione.
- No inventar servicios, textos comerciales, secciones o funciones adicionales.
- Mantener componentes del servidor por defecto y usar componentes del cliente para las interacciones que los requieran.
- La tipografía y el icono actuales son provisionales, pendientes del material de marca.

## Seguridad

- El inicio no utiliza formularios, cuentas, analítica, cookies propias ni claves externas.
- Las variables locales se guardan en `.env.local`, excluido de Git. `.env.example` solo contiene instrucciones o nombres sin valores privados.
- Las variables con prefijo `NEXT_PUBLIC_` son públicas. Nunca usar ese prefijo para secretos.
- `public/.htaccess` se copia a `out/.htaccess` durante la exportación. En Apache aplica HTTPS, cabeceras contra interpretación incorrecta de archivos e incrustación externa, política de referidos y permisos de cámara, micrófono y ubicación.
- La CSP inicial limita URL base, objetos, incrustación y destino de formularios. En producción también solicita HTTPS para los recursos. Es una política parcial: todavía no restringe scripts mediante `script-src` ni aplica `default-src`. Ampliarla y comprobarla al definir las integraciones finales.
- Al incorporar formularios, implementar validación en servidor, límites de tamaño y frecuencia y protección contra spam. Definir el tratamiento de datos y los avisos de privacidad según el país y los datos recopilados.
- Revisar avisos de seguridad antes de publicar y al mantener el sitio. No aplicar `npm audit fix --force` sin revisar sus efectos.
- La compilación correcta y una auditoría sin hallazgos conocidos no sustituyen la revisión de la aplicación.

## VacaWeb

El proyecto se exporta de forma estática mediante `output: "export"`. `npm run build` genera el directorio `out/`, listo para un hosting Apache; no requiere Node.js ni ejecutar `next start` en VacaWeb.

1. Ejecutar `npm ci` y `npm run build` con Node.js 24 para generar `out/`.
2. En el Administrador de archivos de VacaWeb, subir y extraer **el contenido** de `out/` en la raíz web asignada al dominio; no subir la carpeta `out` como un nivel adicional.
3. Conservar `.htaccess` en esa raíz. Incluye las cabeceras de seguridad, la redirección a HTTPS, la compresión y la página 404.
4. Configurar el dominio con SSL activo en VacaWeb y comprobar que `https://tu-dominio/servicios/experiencias/` abre correctamente.
5. Antes de reemplazar un sitio existente, conservar una copia de los archivos actuales del dominio.

También se puede subir el archivo `build/pixelsaund-vacaweb.zip` generado para publicación y extraerlo directamente en la raíz web.

## Revisión antes de publicar

- Ejecutar `npm run check`, `npm run build` y `npm audit`.
- Comprobar las secciones contra los bocetos y revisar móvil, tablet y escritorio.
- Revisar navegación por teclado, contraste, textos alternativos y reducción de movimiento si se añaden animaciones.
- Comprobar enlaces, contactos, consola del navegador y solicitudes fallidas.
- Optimizar las imágenes y videos seleccionados y revisar su carga.
- Actualizar título, descripción, favicon, imagen para compartir y datos del dominio cuando exista el contenido final.
- Verificar secretos, cabeceras, integraciones y protección de formularios, si los hay.

Referencias: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [exportación estática de Next.js](https://nextjs.org/docs/app/guides/static-exports), [Tailwind CSS](https://tailwindcss.com/docs/installation/framework-guides/nextjs) y [producción con Next.js](https://nextjs.org/docs/app/guides/production-checklist).
