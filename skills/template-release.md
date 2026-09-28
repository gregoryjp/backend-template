# Skill: template-release

## Cuándo usarla
Al convertir este repo en una plantilla privada de GitHub y al mantenerla/versionarla.

## Entradas obligatorias
- Decisión de versión (semver) y qué cambió.

## Archivos mínimos a leer
- `docs/TEMPLATE.md` (guía de plantilla/versionado).
- `package.json`, `package-lock.json`.
- `CHANGELOG` (si existe).

## Pasos
1. Confirmar `npm run check` en verde y migraciones limpias.
2. Bump de versión en `package.json` (semver, sin romper).
3. Actualizar el changelog y la guía si procede.
4. Subir como plantilla privada (tras autorización explícita del usuario).
5. Documentar que los repositorios futuros **no** reciben actualizaciones automáticas.

## Salida esperada
Plantilla versionada, reproducible, con instrucciones de actualización manual.

## Verificaciones
- Lockfile reproducen la instalación (`npm ci`).
- `.env.example` no contiene secretos.

## Condiciones para detenerse
- Sin autorización explícita: no publicar, no `git push`, no crear recursos de pago.
