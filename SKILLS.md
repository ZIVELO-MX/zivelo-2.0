# Skills usadas en este proyecto

Este documento es para quien siga trabajando en `zivelo-2.0` (tu agente de IA, o tú
directamente). Lista las **skills** (prompts especializados que Claude Code carga bajo
demanda) que se usaron para construir y auditar el frontend, más las que ya están
disponibles en esta máquina y son directamente relevantes para el trabajo de backend que
sigue (ver `BACKEND-TASKS.md`).

Una skill es un archivo `SKILL.md` (a veces con `references/` adicionales) que vive en
`~/.claude/skills/<nombre>/`. Claude Code las detecta automáticamente por nombre o
descripción; también se pueden invocar a mano con `/nombre-skill`.

## Cómo instalarlas

Hay dos tipos, según su origen:

### A. Instalables por marketplace (comando directo)

Estas vienen de un repo público de GitHub — se instalan con `/plugin`:

| Skill / plugin | Marketplace | Comando |
|---|---|---|
| `modern-web-guidance` | `GoogleChrome/modern-web-guidance` | `/plugin marketplace add GoogleChrome/modern-web-guidance` luego `/plugin install modern-web-guidance@googlechrome` |
| `engram` (memoria persistente entre sesiones, opcional) | `Gentleman-Programming/engram` | `/plugin marketplace add Gentleman-Programming/engram` luego `/plugin install engram@engram` |
| `ponytail` (modo de respuesta minimalista, opcional — preferencia personal, no imprescindible) | `DietrichGebert/ponytail` | `/plugin marketplace add DietrichGebert/ponytail` luego `/plugin install ponytail@ponytail` |

### B. Skills personales (copiar archivos, no hay repo público)

El resto son parte de una colección personal en `~/.claude/skills/` (symlinks a
`~/.agents/skills/`) y **no están en ningún marketplace** — no existe un comando de
instalación. La forma de replicarlas es pedirle a Raúl que comparta la carpeta
`~/.claude/skills/<nombre>/` (son solo Markdown, sin dependencias) y copiarla igual en tu
`~/.claude/skills/`.

Las que se usaron activamente en este proyecto, con lo que hace cada una:

**Diseño / taste (usadas en la auditoría anti-IA-genérica y de motion):**
- `ui-ux-pro-max` — inteligencia de UI/UX: paletas, tipografías, patrones por stack (incluye Next.js), guías de accesibilidad y animación.
- `design-taste-frontend` — detecta y elimina "AI slop" (em-dashes, eyebrows repetidos, patrones de plantilla) en landing pages y rediseños.
- `redesign-existing-projects` — audita un sitio existente, identifica patrones genéricos de IA y sube el nivel sin romper funcionalidad.
- `impeccable` — crítica y pulido integral de interfaces: jerarquía visual, accesibilidad, motion, copy, estados de error.
- `design-critique` — estructura de crítica de diseño con feedback accionable.
- `baseline-ui` — pasada rápida de limpieza: spacing, jerarquía, tipografía.
- `apple-design` — principios de "Designing Fluid Interfaces" de Apple (WWDC) traducidos a CSS/web: respuesta al toque, springs, interrumpibilidad, materiales.
- `emil-design-eng` — filosofía de Emil Kowalski: easing curves, `transition: all` prohibido, feedback de presión, springs vs. keyframes.
- `animation-vocabulary` — glosario inverso: convierte una descripción vaga de una animación en su nombre técnico exacto.
- `review-animations` — revisa código de animación contra el estándar de Emil Kowalski; por defecto marca errores, la aprobación se gana.

**Calidad / accesibilidad / deuda técnica:**
- `web-quality-audit` — auditoría de performance, accesibilidad, SEO y buenas prácticas (usa Lighthouse).
- `accessibility` — guía WCAG 2.2 completa (POUR, contraste, formularios, ARIA).
- `fixing-accessibility` — checklist accionable para corregir issues de accesibilidad puntuales, con fixes mínimos.
- `optimized-nextjs-typescript` — mejores prácticas de Next.js + TypeScript: Server Components, composición sobre clases, manejo de errores.
- `maintainable-code` — cómo escribir/revisar código para que otro humano lo pueda mantener sin contexto de la sesión.
- `code-refactoring-tech-debt` — inventario y plan de remediación de deuda técnica (duplicación, complejidad, cobertura de tests).

**Meta:**
- `find-skills` — ayuda a descubrir qué skill instalar para una necesidad nueva.
- `humanizer` — quita el tono genérico de "escrito por IA" del texto.
- `caveman` — fuerza respuestas cortas y directas.

## C. Bonus: skills ya instaladas y clave para el backend

Estas **no se usaron todavía** en este proyecto (el trabajo de Supabase se dejó para después
a propósito), pero ya están instaladas en esta máquina y son justo lo que necesita el
trabajo descrito en `BACKEND-TASKS.md`. Si tu agente corre en esta misma cuenta de Claude
Code, ya las tiene disponibles sin instalar nada:

- `supabase-senior` — Auth, RLS, diseño de esquema, Edge Functions, storage, realtime, migraciones, hardening de producción, específico para apps Next.js.
- `postgres-dba` — convenciones de PostgreSQL: naming, migraciones (Prisma/Drizzle), estrategia de índices, relaciones, optimización de queries.
- `nextjs-fullstack` — convenciones de App Router: Server Components, Server Actions, API Routes, estructura de archivos, data fetching, manejo de errores.
- `typescript-conventions` — TypeScript estricto para frontend y backend: tipos, genéricos, validación con Zod, política de cero `any`.

Si el agente de tu compañero no tiene acceso a esta colección personal, como mínimo debería
instalar `supabase-senior` y `postgres-dba` manualmente (pedir los archivos, o construir
el equivalente a partir de la documentación oficial de Supabase) antes de tocar el schema o
las políticas RLS — son las que más impactan la seguridad del backend.

## D. Skills instaladas para Codex (julio 2026)

Se instalaron globalmente tanto para Codex (`~/.codex/skills/`) como para Claude Code
(`~/.claude/skills/`); estarán disponibles en nuevas sesiones de ambos agentes. Son
complementarias a las skills personales anteriores y se eligieron por su alineación con el
trabajo de este repositorio:

- `web-design-guidelines` — Vercel: guía para construir y revisar interfaces web de alta
  calidad, con foco en accesibilidad, interacción y detalles de implementación.
- `react-best-practices` (`vercel-react-best-practices` en Claude Code) — Vercel: patrones
  de rendimiento y arquitectura para React/Next.js; sirve también para auditar componentes,
  data fetching, bundles y refactors existentes.
- `seo-audit` — Corey Haines: auditoría priorizada de crawlability, indexación, SEO técnico,
  contenido y datos estructurados.
- `user-onboarding` — Lenny Skills: diseño de activación de producto, definición del momento
  de valor y reducción de fricción en los primeros pasos.
- `code-review` — Matt Pocock: revisión estructurada de cambios con hallazgos accionables.

## E. Coordinación entre Claude Code y Codex (opcional)

Se identificó `aradotso/trending-skills@codex-plugin-cc`, un plugin para Claude Code que
permite delegar tareas y revisiones al CLI local de Codex y retomar sus sesiones. No se
instaló: aunque sus auditorías automáticas reportan aprobación, su adopción aún es limitada
(786 instalaciones, 60 estrellas en julio de 2026). Evaluarlo primero en un repositorio de
prueba antes de incorporarlo al flujo de ZIVELO.

## F. Pendientes de evaluar

- `CodexBar` — aplicación macOS de `steipete/CodexBar` para visualizar cuotas, consumo y
  costos locales de Codex y Claude Code desde la barra de menú; incluye el comando
  `codexbar cost --provider both`. Tiene buena adopción, pero requiere revisar con detalle
  qué datos de sesión local y navegador consulta antes de instalarla.
- `aradotso/codex-skills@codexbar-menubar-ai-usage-tracker` — skill complementaria para
  configurar CodexBar. No instalar sin revisar su contenido y mantenimiento; la adopción
  actual es baja.
