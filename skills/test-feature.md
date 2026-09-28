# Skill: test-feature

## Cuándo usarla
Al escribir o ampliar la cobertura de una funcionalidad.

## Entradas obligatorias
- Spec (aceptación) de la funcionalidad.
- Módulo implementado.

## Archivos mínimos a leer
- Tests existentes del módulo (`src/modules/<m>/__tests__/`).
- `test/setup.ts`, `test/db.ts` (harness).
- `docs/adr/0004-guarded-postgres-test-harness.md`.

## Pasos
1. Enumerar casos: reglas/validadores, endpoints, persistencia real, permisos, expiración/revocación, tokens de un solo uso, concurrencia, unicidad, transacciones, errores de proveedor, contratos de respuesta.
2. Escribir tests con datos únicos y fixtures pequeñas; reloj controlado si hay expiración (sin sleeps).
3. Ejecutar `npm test -- <módulo>`.

## Salida esperada
Suite del módulo en verde, casos negativos cubiertos.

## Verificaciones
- Sin `.only`, sin tests falsos, sin omisiones silenciosas.
- El DB de test es el aislado y protegido (nunca dev/prod).

## Condiciones para detenerse
- No hay forma de aislar el caso sin tocar el DB real → detener y replantear el diseño del test.
