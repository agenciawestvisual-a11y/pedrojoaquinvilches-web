# pedrojoaquinvilches-web

Web personal de Pedro Joaquin Vilches, editor de video. Estudio West Visual.

Es un sitio estático (HTML, CSS y JS, sin build), listo para publicar en GitHub Pages.

## Archivos

- `index.html`: contenido y textos.
- `styles.css`: diseño, con la paleta del logo de West Visual.
- `main.js`: reproductores de video y pestañas de nichos.
- `assets/`: logo y favicon.

## Cómo cargar un video

Cada espacio de video en `index.html` es un `<div class="video" data-src="">`. Pegá en `data-src` el link de la pieza:

```html
<div class="video vertical" data-src="https://youtube.com/shorts/XXXXXXXX" data-title="Propiedad · reel"></div>
```

- Sirven links de YouTube (normales, Shorts o youtu.be), Vimeo y Google Drive.
- En Drive, el archivo tiene que estar compartido como "Cualquier persona con el enlace".
- `vertical` es para reels (9:16); sin esa clase el marco es horizontal (16:9).
- Si `data-src` queda vacío, se ve el marco "PIEZA PENDIENTE".

## Pendientes de contenido

- Reel general (arriba de todo) y 3 piezas por nicho.
- Foto de Pedro en `assets/pedro.jpg` (ver comentario en la sección Sobre mí).
- Links reales de contacto: mail, WhatsApp, LinkedIn, Instagram y Discord.

## Ver en la compu

Abrí `index.html` en el navegador, o desde la carpeta corré `python3 -m http.server` y entrá a http://localhost:8000.

## Publicar en GitHub Pages

En el repositorio: Settings › Pages › Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`. La web queda en `https://agenciawestvisual-a11y.github.io/pedrojoaquinvilches-web/`. Para usar un dominio propio, se configura en esa misma pantalla.
