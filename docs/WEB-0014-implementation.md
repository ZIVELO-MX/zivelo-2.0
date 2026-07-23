# WEB-0014 — Procesar contactos con Supabase y Zoho SMTP

> [!CAUTION]
> **DOCUMENTO TEMPORAL DE IMPLEMENTACIÓN.**
> Borrar este archivo cuando la rama esté lista y **antes de abrir el pull request**.
> Su propósito es guiar el trabajo en `feat/WEB-0014-contact-submission`; no debe llegar a `main`.

## Resultado esperado

Reemplazar el éxito simulado del formulario de contacto por un flujo server-only que:

1. valide y normalice los datos;
2. descarte silenciosamente el honeypot;
3. persista una sola solicitud en Supabase;
4. reclame de forma atómica un solo intento de correo;
5. envíe mediante el SMTP de Zoho;
6. conserve la solicitud si el correo falla;
7. responda con estados accesibles en español e inglés.

El navegador no debe recibir secretos ni escribir directamente en
`contact_submissions`.

## Decisiones cerradas

- Rama: `feat/WEB-0014-contact-submission`.
- Persistencia: Supabase con acceso server-only mediante `SUPABASE_SECRET_KEY`.
- Correo: Zoho SMTP mediante Nodemailer; no Resend.
- SMTP recomendado: `smtppro.zoho.com`, puerto `587`, STARTTLS.
- Cuenta remitente y destinataria: `contacto@zivelo.dev`.
- `Reply-To`: correo validado del visitante.
- Auditoría mínima: no guardar IP ni user-agent en WEB-0014.
- Si Supabase no puede guardar, mostrar un error general recuperable.
- Si Zoho falla después de guardar, mostrar recepción confirmada y conservar la
  fila como `failed`.
- CI y E2E usarán adaptadores falsos explícitos; nunca enviarán correo real ni
  escribirán en producción.
- El despliegue público de Next.js y la verificación SMTP desde ese runtime se
  harán en una misión posterior.

## Paso 1 — Preparar y documentar

- [x] Actualizar `main`.
- [x] Crear `feat/WEB-0014-contact-submission`.
- [x] Crear este documento temporal.
- [ ] Leer las guías locales de Next.js 16 relevantes para Server Actions,
      formularios y `useActionState` antes de escribir código.
- [ ] Consultar WEB-0014 y preservar su contenido antes de actualizarla.
- [ ] Actualizar WEB-0014 para registrar Zoho SMTP, la rama y el alcance
      definitivo.

## Paso 2 — Diseñar la persistencia

Crear una migración Supabase para `public.contact_submissions` con:

- `id uuid` como clave primaria e idempotente, generado al renderizar el
  formulario;
- nombre, empresa opcional, correo, código estable de tema, mensaje y locale;
- `delivery_status` limitado a `pending`, `sending`, `sent` y `failed`;
- `delivery_attempts`, `delivery_attempted_at`, `email_sent_at`;
- referencia técnica del proveedor y código de error normalizado, sin guardar
  respuestas sensibles completas;
- `created_at` y `updated_at`;
- restricciones de longitud y valores coherentes con la validación del servidor;
- índices para administración por fecha y recuperación por estado.

Seguridad:

- habilitar RLS;
- negar INSERT, UPDATE y DELETE directos a `anon` y `authenticated`;
- permitir SELECT únicamente a administradores mediante el mecanismo existente
  de `admin_users`;
- realizar escrituras solo con el cliente server-only;
- no incluir IP, user-agent ni secretos.

La reclamación del intento debe ser una actualización condicional atómica:
únicamente una transición `pending -> sending` con `delivery_attempts = 0` puede
obtener permiso para llamar a Zoho. Una repetición con el mismo UUID debe
recuperar la fila existente y no iniciar otro intento.

## Paso 3 — Separar contratos y adaptadores

Crear contratos internos para:

- repositorio de solicitudes: insertar idempotentemente, reclamar intento y
  marcar `sent` o `failed`;
- mailer: recibir el contacto normalizado y devolver la referencia de entrega;
- resultado de la Server Action: éxito, errores por campo o error general.

Implementaciones:

- producción: Supabase server-only y Nodemailer/Zoho;
- pruebas: repositorio y mailer en memoria con contadores observables.

El driver falso debe requerir una bandera explícita de pruebas. Si se intenta
activar fuera del entorno autorizado de CI/E2E, la aplicación debe fallar de
forma segura; producción nunca debe caer silenciosamente en mocks.

## Paso 4 — Implementar la Server Action

Orden obligatorio:

1. Recibir `(previousState, formData)`.
2. Validar el UUID de idempotencia y el locale.
3. Normalizar espacios, correo y códigos de tema.
4. Validar nombre, empresa, correo, tema y mensaje con límites compartidos.
5. Si el honeypot contiene texto, devolver el mismo éxito visible sin guardar ni
   enviar.
6. Insertar la solicitud `pending` de forma idempotente.
7. Si guardar falla, registrar el error solo en servidor y devolver un mensaje
   general traducido.
8. Reclamar atómicamente el primer intento.
9. Enviar un correo HTML escapado y una alternativa de texto plano mediante
   Zoho.
10. Marcar `sent` con fecha y referencia, o `failed` con un código seguro.
11. En ambos resultados del SMTP, confirmar recepción al visitante.

No exponer errores de Supabase, SMTP, credenciales ni contenido interno en la
respuesta al cliente.

## Paso 5 — Integrar el formulario accesible

- Enviar con `<form action={formAction}>` y `useActionState`.
- Conservar HTML semántico, labels visibles, atributos `name`, `autocomplete` y
  restricciones nativas.
- Renderizar el UUID inicial desde el servidor en un campo oculto.
- Rotar el UUID y limpiar el formulario únicamente después del éxito visible.
- Deshabilitar el botón mientras está pendiente para impedir doble interacción.
- Asociar cada error mediante `aria-invalid` y `aria-describedby`.
- Añadir un resumen anunciado y mover el foco al primer campo inválido.
- Anunciar éxito y errores generales con una región viva apropiada.
- Mantener el honeypot fuera del orden de tabulación y de lectores de pantalla.
- Agregar mensajes ES/EN para pendiente, resumen, error general y éxito.
- Preservar el diseño ZIVELO y respetar `prefers-reduced-motion`.

## Paso 6 — Variables y operación de Zoho

Documentar sin valores reales:

```dotenv
ZOHO_SMTP_HOST=smtppro.zoho.com
ZOHO_SMTP_PORT=587
ZOHO_SMTP_USER=contacto@zivelo.dev
ZOHO_SMTP_APP_PASSWORD=
CONTACT_FROM_EMAIL=contacto@zivelo.dev
CONTACT_TO_EMAIL=contacto@zivelo.dev
```

La contraseña debe ser una contraseña específica de aplicación generada en
Zoho. El usuario la configurará directamente en el entorno de despliegue; no se
compartirá por chat, no se imprimirá y no se guardará en Git.

## Paso 7 — Verificación automatizada

### Base de datos

- [ ] `supabase db reset` reconstruye el esquema.
- [ ] Anon y usuarios autenticados no pueden escribir.
- [ ] Un administrador puede leer solicitudes.
- [ ] Un usuario no administrador no puede leerlas.
- [ ] Las restricciones de estado, locale y longitudes fallan correctamente.

### Unitarias e integración

- [ ] Una entrada válida crea una fila y realiza un intento.
- [ ] Repetir el mismo UUID no duplica fila ni intento.
- [ ] Datos inválidos no guardan ni envían.
- [ ] El honeypot devuelve éxito sin guardar ni enviar.
- [ ] Un error de Supabase devuelve error general.
- [ ] Un error SMTP conserva la fila como `failed` y devuelve recepción
      confirmada.
- [ ] El correo usa `contacto@zivelo.dev` y el visitante queda en `Reply-To`.

### Navegador

- [ ] Éxito en español e inglés usando adaptadores falsos.
- [ ] Errores accesibles y foco en el primer campo inválido.
- [ ] Honeypot con éxito aparente.
- [ ] Estado pendiente y prevención de doble envío.
- [ ] Ninguna prueba utiliza Supabase remoto ni Zoho real.

### Comandos finales

- [ ] lint;
- [ ] typecheck;
- [ ] pruebas unitarias;
- [ ] `supabase db reset` y pgTAP;
- [ ] build de producción;
- [ ] Playwright E2E;
- [ ] pipeline de GitHub en verde.

## Paso 8 — Entrega y migración remota

1. Revisar que no existan secretos ni logs sensibles.
2. Actualizar los tipos generados de Supabase.
3. Actualizar WEB-0014 solo con resultados realmente verificados.
4. **Borrar este documento temporal.**
5. Confirmar que su eliminación esté incluida en el último commit.
6. Hacer push de la rama.
7. Abrir un PR exclusivo con referencia a WEB-0014.
8. Dejar que GitHub Actions ejecute todas las validaciones.
9. El usuario revisa y realiza el merge.
10. Después del merge, aplicar la migración al Supabase remoto, verificar el
    esquema y adjuntar la evidencia a WEB-0014.

WEB-0014 no incluye seleccionar hosting ni desplegar Next.js. La prueba real de
SMTP desde la aplicación publicada queda en la misión de despliegue.

## Misiones derivadas que deben crearse

### Auditar contactos con IP completa y política de retención

- Tipo: `side_quest`.
- Estado inicial: `later`.
- Responsable: Zibot.
- Dependencia: WEB-0014.
- Alcance: aviso de privacidad, consentimiento, base legal, retención,
  eliminación, acceso, revisión legal, rate limiting, abuso y seguridad para
  almacenar IP completa.

### Desplegar la web corporativa y validar el formulario real

- Estado inicial: `later`.
- Responsable: Zibot.
- Dependencia: WEB-0014.
- Debe seleccionar y configurar la plataforma de hosting, dominio, variables,
  observabilidad y rollback.
- Debe documentar y ejecutar:
  - envío válido desde la aplicación desplegada;
  - una sola fila y un solo correo recibido;
  - `delivery_status = sent`;
  - destinatario y `Reply-To` correctos;
  - datos inválidos y honeypot sin fila ni correo;
  - fallo SMTP controlado en preview/staging, conservando la fila `failed`;
  - evidencia de recepción, logs seguros y estado final en Supabase.

