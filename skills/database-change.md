# Skill: database-change

## Cuándo usarla
Cuando una feature exige cambiar el esquema (nuevo modelo, columna, índice, constraint).

## Entradas obligatorias
- Diseño del arquitecto (campos, constraints, índices).

## Archivos mínimos a leer
- `prisma/schema.prisma`.
- La migración precedente para seguir convenciones de nombres.
- `docs/adr/0004-guarded-postgres-test-harness.md`.

## Pasos
1. Editar `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <verbo>_<objeto>` (usa el DB de desarrollo).
3. Revisar el SQL generado (no aceptar a ciegas).
4. Añadir/ajustar tests que dependan del cambio (migración sobre base vacía incluida).
5. `npx prisma generate` y `npm run check`.

## Salida esperada
Migración en `prisma/migrations/`, cliente regenerado, tests verdes.

## Verificaciones
- Migración aplica sobre base vacía (el harness ya la ejecuta).
- Los nombres de columna siguen la convención existente (camelCase en este repo).

## Condiciones para detenerse
- Migración destructiva sobre datos existentes → confirmar plan con un humano antes de aplicar en entornos reales.
- Diferencia entre schema y BD (`prisma migrate diff`/`status`) distinta de cero → resolver antes de continuar.
