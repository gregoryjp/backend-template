# Skill: security-review

## Cuándo usarla
Antes de dar por cerrada una feature que toca auth, datos ajenos, entrada de usuario o efectos sensibles.

## Entradas obligatorias
- Spec de la funcionalidad.
- Diff a revisar (`git diff`).

## Archivos mínimos a leer
- El diff completo de la feature.
- `src/modules/auth/middleware/*` (autorización).
- `src/infrastructure/errors.ts`, `logger.ts` (redacción).

## Pasos
1. Revisar autorización en backend (nunca confiar en el cliente).
2. Revisar acceso a recursos ajenos (resolución por sesión, no por id del cuerpo).
3. Revisar mass assignment (allowlist explícita).
4. Revisar manejo de secretos/tokens (hash at rest, no en logs/respuestas).
5. Revisar enumeración, abuso y rate limiting.

## Salida esperada
Hallazgos clasificados (blocker / should-fix / nit) con `file:line`.

## Verificaciones
- Ningún secreto en logs ni en respuestas.
- Tests cubren los casos negativos relevantes.

## Condiciones para detenerse
- Un blocker de seguridad → corregir antes de fusionar.
