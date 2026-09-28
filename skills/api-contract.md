# Skill: api-contract

## Cuándo usarla
Al definir o cambiar un endpoint (ruta, cuerpo, respuesta, códigos de error).

## Entradas obligatorias
- Endpoint a especificar (método, ruta, propósito).

## Archivos mínimos a leer
- `docs/modules/<m>.md` (contrato vigente).
- `src/modules/<m>/routes/`, `controllers/`, `schemas/`.

## Pasos
1. Definir request (params/query/body) y su esquema Zod.
2. Definir respuestas de éxito y de error (código + shape, reusando el modelo de errores).
3. Actualizar/crear la colección Bruno (`bruno/`) y el contrato OpenAPI (`docs/openapi/openapi.yaml`).
4. Actualizar `docs/modules/<m>.md`.

## Salida esperada
Endpoint documentado en OpenAPI + Bruno + contrato de módulo.

## Verificaciones
- El shape documentado coincide con el real (test de contrato de respuesta).
- Errores usan el modelo consistente (`AppError`).

## Condiciones para detenerse
- Cambio rompe un contrato ya publicado → tratarlo como breaking y documentarlo.
