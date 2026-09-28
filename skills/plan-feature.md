# Skill: plan-feature

## Cuándo usarla
Tras un `prd-intake` aprobado, para convertir un requisito en spec + backlog.

## Entradas obligatorias
- Requisito(s) del PRD a planificar.
- Resultado del `prd-intake`.

## Archivos mínimos a leer
- `docs/BACKLOG.md`, `docs/STATE.md`, `docs/PROJECT_MAP.md`.
- `docs/ARCHITECTURE.md`.
- Specs de módulos afectados (`docs/specs/`).

## Pasos
1. Redactar la spec de la funcionalidad (requisitos + aceptación).
2. Trazar requisito → spec → (futuro) código/prueba/revisión.
3. Descomponer en tareas con dependencias (orden topológico).
4. Estimar qué módulos/capas se tocan.

## Salida esperada
Spec en `docs/specs/<feature>.md` y entradas en `docs/BACKLOG.md` con dependencias.

## Verificaciones
- Cada requisito tiene aceptación verificable.
- No se duplican reglas ya documentadas.

## Condiciones para detenerse
- Dependencia circular entre tareas → reordenar o replantear el alcance.
