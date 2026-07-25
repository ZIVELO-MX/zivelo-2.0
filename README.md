# ZIVELO — Sitio corporativo

Sitio web corporativo de ZIVELO (estudio de ingeniería de software), construido en Next.js 16 (App Router) con soporte bilingüe (ES/EN) vía `next-intl`.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **next-intl** — enrutamiento por idioma con slugs localizados (`/nosotros` vs `/about`, `/servicios` vs `/services`, etc.)
- **TypeScript** estricto, sin `any`
- **CSS vanilla** (sin frameworks de utilidades) — tokens de diseño en `src/app/[locale]/globals.css`
- **Supabase** (pendiente) — blog, panel de administración y autenticación real

## Instalación

```bash
git clone git@github.com:ZIVELO-MX/zivelo-2.0.git
cd zivelo-2.0
nvm install
nvm use
corepack enable
corepack prepare pnpm@11 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Skill local para Pull Requests

El skill `manage-pull-requests` se versiona dentro del repositorio en
`.agents/skills/manage-pull-requests`. No requiere instalación global ni copiar archivos:
queda instalado con el `git clone`.

Después de clonar o actualizar el repositorio, abre la raíz del proyecto en Codex e inicia una
sesión nueva para que vuelva a descubrir los skills locales. Puedes invocarlo explícitamente con:

```text
Usa $manage-pull-requests para crear y administrar el PR de esta rama.
```

El skill abre el PR cuando el cambio ya es revisable, delega las pruebas automatizadas al
pipeline, configura explícitamente si se necesitan capturas mediante el ID de misión y nunca
hace merge sin una solicitud expresa del usuario.

## Comandos

```bash
pnpm build        # build de producción
pnpm start        # sirve el build de producción
pnpm lint         # eslint
pnpm typecheck    # TypeScript sin emitir archivos
pnpm test:unit    # pruebas unitarias Node
pnpm test:db      # pgTAP contra Supabase local (requiere Docker)
pnpm test:e2e     # smoke tests Chromium (usa el build de producción)
pnpm check        # lint + typecheck + unit
```

El workflow de pull requests ejecuta esos mismos controles en los jobs `quality`, `database` y
`build-browser`. `database` usa un proyecto Supabase efímero; nunca apunta al proyecto remoto.

## Estructura

```
src/
├── app/[locale]/       # páginas (App Router, una carpeta por ruta)
│   ├── blog/           # listado + artículo (datos de ejemplo, ver src/lib/blog-data.ts)
│   ├── globals.css     # sistema de diseño completo del sitio
│   └── layout.tsx      # layout raíz (fuentes, tema, JSON-LD)
├── components/         # componentes compartidos (header, footer, formularios, etc.)
├── i18n/                # configuración de next-intl (rutas, navegación)
├── lib/                 # helpers compartidos (SEO, params, constantes de contacto)
└── messages/             # traducciones ES/EN
```

## Estado del proyecto

El frontend (9 páginas + blog) está completo y auditado (SEO, accesibilidad, performance). Ver [`AVANCE-PROYECTO.md`](./AVANCE-PROYECTO.md) para el detalle de avance.

Pendiente: integración real de Supabase (blog dinámico, panel de administración, autenticación, envío de formulario de contacto) y contenido real del cliente (capturas de proyectos, testimonios, fotos de equipo).

## Referencia de diseño

La carpeta `reference/` contiene el prototipo HTML original (handoff de diseño) usado como referencia de alta fidelidad durante la migración a Next.js.
