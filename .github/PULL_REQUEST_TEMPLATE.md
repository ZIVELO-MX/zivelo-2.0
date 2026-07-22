## Descripción

<!-- Breve descripción del cambio. -->

## Misión de Zipform

Misión: WEB-XXXX

<!--
  Sustituye WEB-XXXX por el identificador real (ej. WEB-0005).
  Si se deja como WEB-XXXX o se omite la línea, el pipeline imprime:
  "No completed 'Misión: WEB-XXXX' field in PR description; skipping screenshots"
  y omite el paso de screenshots sin fallar.
-->

## Checklist del desarrollador

- [ ] El código sigue las convenciones del proyecto
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run typecheck` pasa sin errores
- [ ] `npm run build` compila correctamente
- [ ] `npm run test:e2e` pasa (si aplica)
- [ ] Se probó manualmente en entorno local

## Screenshots de la misión

Cuando se completa el identificador anterior, el pipeline `Publish Mission screenshots` publica las capturas en esa misión y añade el enlace al PR.

## Notas adicionales

<!-- Cualquier contexto extra, decisiones técnicas, o dependencias. -->
