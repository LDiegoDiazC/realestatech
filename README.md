# Real Estate Chapultepec

Landing page para una inmobiliaria boutique que opera en las colonias alrededor del Bosque de Chapultepec (Polanco, Lomas de Chapultepec, Bosques de las Lomas y San Miguel Chapultepec).

Construida con **HTML5 semántico, CSS3 y JavaScript vanilla**, sin frameworks ni dependencias en tiempo de ejecución.

> **Sitio de demostración:** propiedades, precios, teléfono, correo y dirección son ficticios. Las fotografías provienen de [Unsplash](https://unsplash.com/license).

## Características

- Diseño editorial y arquitectónico basado en una paleta monocromática.
- Mobile-first y fluido desde 320 px hasta pantallas amplias (CSS Grid, Flexbox, `clamp()`, container queries).
- Modo claro y oscuro: respeta `prefers-color-scheme` y permite cambio manual guardado en `sessionStorage`.
- Accesibilidad WCAG 2.2 AA: landmarks, jerarquía de encabezados, navegación por teclado, `:focus-visible`, `prefers-reduced-motion`.
- Formulario con validación del lado del cliente, estados de envío y mensaje de éxito simulado.
- Botón flotante de WhatsApp que se oculta en la sección de contacto.
- Imágenes WebP responsive (`srcset`/`sizes`), `width`/`height` y `loading="lazy"`.
- SEO básico: meta description, Open Graph y datos estructurados (`RealEstateAgent`).

## Estructura

```
/
├── index.html
├── css/
│   └── styles.css        # tokens, tema, componentes y secciones
├── js/
│   └── main.js           # tema, navegación, scroll, propiedades y formulario
└── assets/
    ├── fonts/            # Archivo (variable, OFL)
    ├── icons/            # favicon
    └── images/           # fotografías WebP en 640/1024/1600 px
```

## Ejecutar localmente

No requiere instalación. Sirve la carpeta con cualquier servidor estático:

```bash
# Python
python -m http.server 5500

# o Node.js
npx serve .
```

Después abre `http://localhost:5500`.

## Personalización

| Qué | Dónde |
|---|---|
| Colores, tipografía, espaciado, radios, sombras | Variables CSS en `:root` de `css/styles.css` |
| Propiedades | Cada `<article class="property">` en `index.html` (marcado con `<!-- DEMO -->`) y su `<option>` en `#f-property` |
| Imágenes | `assets/images/prop-<slug>-{640,1024,1600}.webp` |
| Teléfono y WhatsApp | Buscar `525500000000` en `index.html` |
| Dominio, Open Graph y JSON-LD | Buscar `https://www.example.com` en `index.html` |
| Aviso de privacidad | `#aviso-privacidad` en el footer |

## Integración del formulario

El envío está simulado. Para conectarlo a un servicio o API, reemplaza la función `sendInquiry()` en `js/main.js` (marcada con `TODO(API)`).

## Créditos

- Tipografía: [Archivo](https://fonts.google.com/specimen/Archivo), bajo SIL Open Font License (`assets/fonts/OFL.txt`).
- Fotografías: [Unsplash](https://unsplash.com/license), solo como imágenes de referencia.
