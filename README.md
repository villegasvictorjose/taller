# AdminVV Taller · Demo

Demo interactiva, solo front, para quien comente TALLER en los videos.
No tiene servidor, base de datos ni paso de compilación: son archivos estáticos.
Nada se guarda; al recargar la página la demo vuelve al inicio.

## Estructura

```
taller-demo/
├── index.html        Página única
├── css/styles.css    Estilos (móvil primero, tablero en 3 columnas en escritorio)
├── js/config.js      ← Lo único que necesitas editar
├── js/app.js         Lógica de la demo
├── assets/           Logo, favicon e imagen de vista previa (og.png)
└── _headers          Cabeceras para Cloudflare Pages
```

## Antes de publicar

1. **`js/config.js`**: pon tu número en `whatsapp` (código de país y solo dígitos,
   por ejemplo `584121234567`). Ahí mismo puedes cambiar el mensaje, el nombre del
   taller de ejemplo, la moneda, el catálogo y los carros que aparecen cargados.
2. **`index.html`**: reemplaza `TU-DOMINIO.pages.dev` (aparece dos veces) por la
   dirección real. Sin esto, WhatsApp no mostrará la imagen al compartir el enlace.

## Probar en tu computadora

Abre `index.html` con doble clic, o levanta un servidor local:

```
npx serve .
```

## Publicar en Cloudflare Pages

**Opción rápida (sin Git):** en el panel de Cloudflare entra a
Workers & Pages → Create → Pages → Upload assets, y arrastra la carpeta `taller-demo`.

**Con Wrangler:**

```
npx wrangler pages deploy . --project-name adminvv-taller
```

**Con Git:** conecta el repositorio y deja vacío el comando de compilación;
el directorio de salida es la raíz (`/`).

## Qué puede hacer el visitante

1. Abrir una orden con placa, datos y hasta 3 fotos (se quedan en su navegador).
2. Armar el presupuesto con el catálogo o con conceptos de precio libre.
3. Enviarlo y ver el mensaje que recibiría el cliente.
4. Cambiar a la vista Cliente y aprobar o rechazar.
5. Marcar el carro como listo y ver el aviso con la factura.

Una guía de 6 pasos acompaña el recorrido y termina con el botón de WhatsApp.

## Límites conocidos

- No se envía ningún mensaje real: el "enlace del cliente" es de ejemplo.
- No sabrás quién usó la demo salvo que te escriba. Para medir visitas puedes
  activar Cloudflare Web Analytics desde el panel, sin tocar el código.
