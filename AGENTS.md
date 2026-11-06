# PixelSaund

- Stack: Next.js App Router, React, TypeScript y Tailwind CSS. Usar npm y Node.js 24.
- Leer README.md para la estructura, los comandos y las condiciones de despliegue.
- El usuario diseña en Canva y entrega capturas por sección. Reproducirlas con fidelidad y ajustar según sus indicaciones. No inventar contenido ni funciones.
- La pantalla y el icono iniciales son provisionales hasta recibir el diseño de marca.
- Conservar los originales de assets/. Solo publicar las copias seleccionadas y optimizadas en public/. Los originales se excluyen de Git y requieren respaldo separado.
- Usar componentes del servidor por defecto e interactividad del cliente donde sea necesaria. Conservar adaptación móvil y accesibilidad.
- Guardar secretos únicamente en servidor y variables privadas. Nunca incluirlos en public/, Git o variables NEXT_PUBLIC_.
- Mantener las cabeceras de seguridad. La CSP inicial es parcial: ampliar y probar las restricciones de scripts al definir las integraciones.
- Si se agregan formularios, validar en servidor y proteger contra spam y abuso; revisar privacidad según los datos y el país.
- Biome revisa el código; Prettier administra el formato. Ejecutar npm run check y npm run build tras cambios de aplicación o configuración. Revisar npm audit al modificar dependencias y antes de publicar.
- El destino acordado es Vercel. Mantener la configuración estándar de Next.js. Esta fase prepara el entorno local; publicar cuando el usuario lo solicite.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
