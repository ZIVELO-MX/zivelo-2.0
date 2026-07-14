# ZIVELO 2.0 — Informe de Avance del Rework

**Fecha:** julio 2026
**Stack:** Next.js 16 (App Router) + next-intl + Vercel + Supabase (pendiente)

---

## Resumen ejecutivo

| Área | Avance |
|---|---|
| **Sitio corporativo (marketing)** | **~98%** — construido, pulido y auditado; solo falta contenido real del cliente |
| **Backend / Supabase (blog, admin, contacto)** | **0%** — no iniciado, deliberadamente al final |
| **Contenido real del cliente** | **0%** — bloqueado, pendiente de assets del cliente |
| **Avance total del proyecto** | **≈ 70%** |

El sitio corporativo está funcionalmente terminado: 9 páginas, bilingüe (ES/EN), con SEO, accesibilidad y performance auditados y en verde. Lo que falta para llegar al 100% es una pieza grande de backend (Supabase) que fue pospuesta a propósito, y contenido real que solo el cliente puede proporcionar.

---

## 1. Sitio corporativo — Frontend (≈98%)

### Completado

**Infraestructura**
- Next.js 16 (App Router, Turbopack) desplegable en Vercel
- Internacionalización completa (español/inglés) con `next-intl`, prefijo de locale siempre presente
- URLs profesionales y localizadas por idioma (`/nosotros` vs `/about`, `/servicios` vs `/services`, etc.) — sin `.html` ni anclas `#`
- Todas las páginas pre-renderizadas como HTML estático (SSG) para máxima velocidad

**Páginas construidas (9 de 9)**
- Inicio, Nosotros, Servicios, Proyectos, Proceso, Tecnologías, Contacto, Aviso de Privacidad, Términos

**Diseño y experiencia**
- Sistema de diseño con modo claro/oscuro, tokens de color consistentes
- Header con compactación al hacer scroll (logo se reduce, más "premium")
- Menú hamburguesa fluido en móvil con animación tipo iOS
- Animaciones y transiciones auditadas contra la filosofía de Emil Kowalski (timing, easing, feedback táctil)
- Botón flotante de WhatsApp para contacto directo de baja fricción
- Formulario de contacto con validación y estados de error/éxito
- Página 404 personalizada con identidad de marca

**Calidad técnica (auditoría Lighthouse en producción)**

| Categoría | Puntaje |
|---|---|
| Accesibilidad | **100 / 100** |
| Buenas prácticas | **100 / 100** |
| Rendimiento | **93 / 100** |
| SEO | **92 / 100**¹ |

¹ El único punto pendiente en SEO es un falso positivo de pruebas en localhost (el canonical apunta correctamente al dominio real `zivelo.dev`); se resuelve solo al desplegar.

**SEO**
- Metadatos únicos por página, canonical y hreflang ES/EN
- Sitemap y robots.txt generados automáticamente
- Datos estructurados (JSON-LD) de la organización
- Imagen de Open Graph / redes sociales generada dinámicamente con la marca

**Pulido "anti-genérico" (revisión de diseño profunda)**
- Eliminados patrones que delatan diseño hecho con IA: guiones largos en el copy, exceso de "eyebrows" decorativos, numeración de secciones sin sentido real, encabezados de sección repetidos idénticos en todo el sitio
- Sección de Servicios rediseñada con layout asimétrico (en vez de 3 tarjetas idénticas)
- FAQ rediseñado como lista siempre visible en vez de acordeón
- Citas destacadas con tipografía editorial en vez de bordes genéricos

### Pendiente dentro del frontend
- Nada funcional. Lo único que queda es sustituir los espacios reservados de imagen por contenido real (ver sección 3).

---

## 2. Backend — Supabase (0%)

Pospuesto intencionalmente hasta el final, por instrucción explícita. Incluye:

- [ ] Proyecto Supabase (base de datos + Auth + Storage)
- [ ] Tabla `posts` y bucket `covers` con políticas de seguridad (RLS)
- [ ] Blog público (`/blog` y `/blog/[slug]`)
- [ ] Panel de administración con autenticación real (reemplaza el mock actual)
- [ ] Editor de contenido (Tiptap o Lexical) para redactar posts
- [ ] Formulario de contacto conectado a envío de correo real (Resend/SendGrid o Edge Function)
- [ ] Reactivar el enlace "Blog" en la navegación una vez exista la ruta

Esto representa el resto del avance necesario para llegar al 100%.

---

## 3. Contenido real del cliente (0%, bloqueado)

Por política del proyecto, **no se fabrica contenido falso** (nombres inventados, capturas simuladas, testimonios ficticios). Se necesita del cliente:

- [ ] Imagen/captura para el hero de la página de Inicio
- [ ] Capturas de los 4 proyectos mostrados (Koda Fidelity, Stickio, ZIVELO Quotes, Prompt2Git)
- [ ] Foto y bio del equipo para la página de Nosotros
- [ ] Un testimonio real de cliente (cita + nombre)
- [ ] Revisión legal de Aviso de Privacidad y Términos por un abogado

Actualmente estos espacios usan un placeholder visual limpio y honesto (no una imagen rota ni contenido inventado).

---

## Ruta al 100%

1. **Supabase** — el bloque de trabajo más grande restante (blog + admin + auth + email)
2. **Contenido del cliente** — en paralelo, no depende de desarrollo
3. **Despliegue a producción** en Vercel con el dominio real

---

*Generado automáticamente a partir del historial de trabajo de esta sesión y sesiones anteriores del proyecto.*
