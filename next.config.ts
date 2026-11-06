import type { NextConfig } from "next";

// El sitio se publica como archivos estaticos en un hosting Apache, asi que
// no hay servidor de Next en produccion:
//   - output "export" escribe todo en out/.
//   - trailingSlash deja cada ruta como carpeta con su index.html, que es lo
//     que Apache sirve sin reglas de reescritura.
//   - las imagenes las prepara scripts/generar-imagenes.mjs y las direcciona
//     src/lib/image-loader.ts; los anchos de abajo son los unicos que se
//     generan, por eso las dos listas tienen que coincidir con el script.
//   - las cabeceras de seguridad viven en public/.htaccess: headers() solo
//     funciona con el servidor de Next y aqui no lo hay.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  devIndicators: false,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [480, 768, 1080, 1440, 1920],
    imageSizes: [96, 160, 256, 384],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.100.57"],
};

export default nextConfig;
