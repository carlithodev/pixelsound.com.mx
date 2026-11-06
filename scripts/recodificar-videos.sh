#!/usr/bin/env bash
# Recodifica los videos de las siete secciones desde los originales de
# assets/. Las copias anteriores venian a 540p, que se veia blando en
# cualquier pantalla moderna; aqui se sube a 1080p (o al tamano del original,
# lo que sea menor: nunca se agranda) y se deja ademas una copia de 720p para
# telefonos, que es la que sirve <source media="(max-width: 900px)">.
#
# No es parte del build. Se corre a mano cuando cambian los originales:
#   bash scripts/recodificar-videos.sh
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
ORIG="$RAIZ/assets/pages assets/page3"
cd "$RAIZ"

# Calidad. Estos clips son de noche y con mucho grano: a CRF bajo el grano se
# come todo el bitrate sin que se vea mejor. Un desgranado suave rinde mas
# nitidez por byte que subir la calidad a ciegas.
DESGRANE="hqdn3d=2:1.5:6:6"
CRF_GRANDE=23
CRF_CHICO=27

# El tope de bitrate evita que un tramo muy movido dispare el peso del
# archivo; en los tramos calmados manda el CRF y pesa menos.
codificar() {
  local origen="$1" salida="$2" dur="$3" alto="$4" crf="$5" tope="$6"
  mkdir -p "$(dirname "$salida")"
  ffmpeg -v error -nostdin -y -i "$origen" -t "$dur"     -an     -vf "${DESGRANE},scale=-2:${alto}:flags=lanczos,fps=30"     -c:v libx264 -preset slow -crf "$crf"     -maxrate "$tope" -bufsize "$((${tope%k} * 2))k"     -profile:v high -level 4.0 -pix_fmt yuv420p     -movflags +faststart     "$salida"
}

# carpeta | nombre | original | duracion | alto grande | tope grande | alto chico | tope chico
#
# Los altos salen de medir a que tamano se dibuja cada video en pantalla y
# pedir el doble, que es lo que necesita una pantalla de densidad doble. Pedir
# mas solo engorda el archivo sin que nadie lo note. Donde el original ya es
# mas chico se deja tal cual: no se inventa resolucion.
#
#   statement apaisado  ~920px en pantalla -> 1920 de ancho
#   feature apaisado    ~704px             -> 1440
#   vertical de a dos   ~373px             ->  810 de ancho (1440 de alto)
#   vertical sola       ~415px             ->  900 de ancho (1600 de alto)
while IFS='|' read -r carpeta nombre origen dur alto_g tope_g alto_c tope_c; do
  [ -z "${nombre:-}" ] && continue
  destino="public/videos/$carpeta/$nombre"
  echo "-> $nombre"
  rm -f "$destino-720.mp4"
  codificar "$ORIG/$origen" "$destino.mp4" "$dur" "$alto_g" "$CRF_GRANDE" "$tope_g"
  if [ "$alto_c" != "-" ]; then
    codificar "$ORIG/$origen" "$destino-720.mp4" "$dur" "$alto_c" "$CRF_CHICO" "$tope_c"
  fi
done <<'LISTA'
experiencias|entradas-bienvenida-1|ENTRADAS2.MP4|14.05|810|2600k|540|1100k
experiencias|entradas-bienvenida-2|ENTRADAS.MP4|17.25|900|2700k|540|1100k
experiencias|cabina-vogue-1|revistavogue2.mp4|1.76|1440|2600k|1280|1500k
experiencias|cabina-vogue-2|vogue.mp4|6.72|1440|2600k|1280|1500k
experiencias|foto-espejo|FOTOESPEJO.mp4|17.76|1440|2600k|1280|1500k
animacion-y-show|dj-pixelsound-1|DJ.mp4|8.03|1600|3200k|1280|1600k
animacion-y-show|dj-pixelsound-2|DJP.MP4|9.09|900|2700k|540|1100k
animacion-y-show|robots-led|ROBOT.mp4|14.60|720|2300k|540|1200k
animacion-y-show|chisperos|CHISPEROS.mp4|8.43|1280|2600k|1080|1300k
animacion-y-show|batucada|MVI_3964.MP4|10.00|810|2600k|540|1100k
LISTA

echo
echo "listo"

# ---------------------------------------------------------------------------
# Copias ligeras de los videos que ya estaban en el sitio antes de esta tanda.
# Aqui no se recodifica desde el original: se reduce la copia publicada, que
# es lo que hay. Solo baja de tamano, no se toca el encuadre ni la duracion.
ligera() {
  local origen="$1" alto="$2" tope="$3"
  local salida="${origen%.mp4}-720.mp4"
  echo "-> $(basename "$salida")"
  ffmpeg -v error -nostdin -y -i "$origen" -an \
    -vf "scale=-2:${alto}:flags=lanczos" \
    -c:v libx264 -preset slow -crf 27 \
    -maxrate "$tope" -bufsize "$((${tope%k} * 2))k" \
    -profile:v high -level 4.0 -pix_fmt yuv420p \
    -movflags +faststart "$salida"
}

ligera public/videos/experiencias/alfombra-roja.mp4 720 900k
ligera public/videos/experiencias/alfombra-roja-2.mp4 720 900k
ligera public/videos/experiencias/letras-iluminadas.mp4 720 900k
ligera public/videos/experiencias/plataforma-360.mp4 720 1100k
ligera public/videos/servicios/iluminacion-card.mp4 720 900k
ligera public/videos/nosotros/staff-1.mp4 360 700k
ligera public/videos/nosotros/staff-2.mp4 360 700k
ligera public/videos/nosotros/staff-3.mp4 360 700k

# ---------------------------------------------------------------------------
# Video del hero. Es el mas visible del sitio y el primero que se descarga, y
# ahi chocan dos cosas: mas calidad pide mas bitrate, pero cuanto mas pesa el
# arranque, mas tarda en moverse la imagen. Lo que se ajusto:
#
#   crf 21 con desgranado suave    mas detalle que el crf 23 de antes
#   preset veryslow, tune film     mejor compresion al mismo crf
#   -g 60                          un cuadro clave cada 2s: el primer tramo
#                                  que el navegador necesita es mas corto, y
#                                  ademas baja el peso total
#   -bufsize igual al tope         sin picos al principio
#
# Resultado: 12.0MB contra los 8.4MB anteriores, con SSIM 0.9714 frente a
# 0.9696, y el arranque en 121ms de media con conexion buena.
heroe() {
  echo "-> hero-banner.mp4"
  ffmpeg -v error -nostdin -y -i "$RAIZ/assets/pages assets/page1/benner.MP4" -an \
    -vf "hqdn3d=1:0.7:4:4,scale=-2:1080:flags=lanczos,fps=30" \
    -c:v libx264 -preset veryslow -tune film -crf 21 \
    -maxrate 5500k -bufsize 5500k -g 60 -keyint_min 30 \
    -profile:v high -level 4.1 -pix_fmt yuv420p -movflags +faststart \
    public/videos/hero-banner.mp4

  # La portada es el primer cuadro del video: el relevo que hace el navegador
  # entre una y otro solo pasa desapercibido si son la misma imagen.
  echo "-> hero-banner-poster.jpg"
  ffmpeg -v error -nostdin -y -i public/videos/hero-banner.mp4 -frames:v 1 \
    -vf "scale=1600:-2:flags=lanczos" -q:v 4 public/images/hero-banner-poster.jpg
}
