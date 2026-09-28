# Skill: project-handoff

## Cuándo usarla
Al cerrar una fase o entregar el proyecto, para dejar estado navegable.

## Entradas obligatorias
- Cambios realizados y su evidencia.

## Archivos mínimos a leer
- `docs/STATE.md`, `docs/BACKLOG.md`, `docs/PROJECT_MAP.md`.
- `git log` / `git status`.

## Pasos
1. Resumir qué cambió (implementación, verificación, revisión).
2. Actualizar `docs/STATE.md` (trabajo actual, siguiente paso, bloqueos, log de verificación).
3. Marcar/cerrar tareas en `docs/BACKLOG.md`.
4. Señalar explícitamente lo pendiente y lo que depende del despliegue real.

## Salida esperada
Estado y backlog coherentes con el repositorio; nada "listo para producción" sin matices.

## Verificaciones
- El log de verificación contiene comando + resultado reales.
- Separado el estado de implementación, verificación automática y revisión independiente.

## Condiciones para detenerse
- Hay evidencia desactualizada por un cambio posterior → re-ejecutar antes de entregar.
