# El Sacamuelas — Edición Aldea Completa

Juego de simulación medieval (barbero-cirujano, año 1347) hecho en HTML5 + JavaScript puro (sin frameworks, sin build, sin `npm install`).

## Estructura del proyecto

```
sacamuelas-vscode/
├── index.html              ← el juego completo (HTML + CSS + JS en un solo archivo)
├── CD1_-_Cirugia.mp3        ← música de fondo (pista 1)
├── CD1_-_Extraccion.mp3     ← música de fondo (pista 2)
├── CD1_-_Sangrado.mp3       ← música de fondo (pista 3)
├── CD1_-_Urgencia.mp3       ← música de fondo (pista 4)
└── .vscode/
    ├── extensions.json      ← recomienda la extensión "Live Server"
    └── settings.json        ← configuración de puerto para Live Server
```

⚠️ **No renombres ni muevas los archivos `.mp3`** — el juego los busca por su nombre exacto (`CD1_-_Cirugia.mp3`, etc.) en la misma carpeta que `index.html`.

## Cómo abrirlo en VSCode

1. Abre esta carpeta completa en VSCode: `File → Open Folder…`
2. VSCode te sugerirá instalar la extensión **Live Server** (aparece un aviso abajo a la derecha, o ve a la pestaña de Extensiones y busca "Live Server" de Ritwick Dey). Instálala.
3. Click derecho sobre `index.html` → **"Open with Live Server"** (o el botón "Go Live" en la barra inferior).
4. Se abre en tu navegador en algo como `http://127.0.0.1:5500`. Listo, a jugar.

### ¿Por qué usar Live Server y no abrir el HTML directamente con doble-click?

Técnicamente puedes abrir `index.html` directo desde el explorador de archivos y funcionará casi todo. Pero algunos navegadores restringen `localStorage` (donde se guarda tu récord y tus ajustes de música) y la carga de audio cuando el archivo se abre como `file://` en vez de `http://`. Live Server sirve el proyecto como si fuera un sitio web real, evitando esos problemas — es la forma más confiable de probarlo.

## Publicarlo en internet (Netlify)

Esta misma carpeta (sin la subcarpeta `.vscode`, aunque no estorba si la subes) se puede arrastrar directo a **https://app.netlify.com/drop** para publicarlo gratis. Netlify usa `index.html` como página principal automáticamente.

## Editar el juego

Todo el código (HTML, CSS y JavaScript) vive en el único archivo `index.html`. Está organizado en secciones comentadas dentro de la etiqueta `<script>`:

- Utilidades y sonido (efectos con Web Audio, sin archivos)
- Música de fondo (sistema de playlist con las 4 pistas)
- Ajustes y récord (guardado en `localStorage`)
- Males, personajes, estado del juego
- Herramientas y minijuegos (uno por cada procedimiento médico)
- Dibujo del paciente en pixel art (canvas)
- Bucle principal del juego

No hay paso de compilación: guardas el archivo y recargas el navegador (Live Server lo recarga solo).
