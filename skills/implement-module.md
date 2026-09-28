# Skill: implement-module

## Cuándo usarla
Para construir un módulo (o feature dentro de uno) según spec y arquitectura.

## Entradas obligatorias
- Spec de la funcionalidad.
- Contrato del módulo (definido por el arquitecto).

## Archivos mínimos a leer
- `docs/ARCHITECTURE.md`, `docs/modules/<m>.md`.
- Un módulo de ejemplo (`src/modules/health/`).
- `src/config/env.ts`, `src/infrastructure/errors.ts`.

## Pasos
1. Crear `src/modules/<name>/` con `routes/controllers/services/repositories/schemas/types/__tests__/index.ts`.
2. Implementar capa a capa (schemas → repositories → services → controllers → routes).
3. Exportar router + contratos desde `index.ts`.
4. Montar el router en `src/infrastructure/http/app.ts`.
5. Escribir tests y ejecutar `npm run check`.

## Salida esperada
Módulo funcional, montado, con tests; `docs/PROJECT_MAP.md`, `docs/modules/<name>.md` y `docs/STATE.md` actualizados.

## Verificaciones
- `npm run check` en verde.
- Sin imports internos de otros módulos; services sin Express; controllers sin Prisma.

## Condiciones para detenerse
- `npm run check` en rojo sin causa clara → corregir o reportar; no entregar en rojo.
