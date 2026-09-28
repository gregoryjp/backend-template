# Skill: prd-intake

## Cuándo usarla
Al recibir un PRD nuevo, antes de cualquier implementación.

## Entradas obligatorias
- Ruta del PRD.

## Archivos mínimos a leer
- El PRD.
- `docs/specs/example-prd.md` (formato de referencia).
- `AGENTS.md`.

## Pasos
1. Comprobar que el PRD incluye: usuarios, objetivos, alcance, reglas, aceptación.
2. Listar contradicciones y decisiones pendientes.
3. Separar lo que ya resuelve la plantilla de lo nuevo.
4. Clasificar ambigüedades: rutinarias (resolver por convención documentada) vs. de producto/seguridad/arquitectura (preguntar).

## Salida esperada
Nota de intake con: check de completitud, contradicciones, decisiones pendientes, mapeo plantilla-vs-nuevo, y preguntas (solo las que importan).

## Verificaciones
- Ninguna decisión de negocio inventada.
- No se ha modificado código ni specs todavía.

## Condiciones para detenerse
- Falta alguno de los 5 bloques obligatorios → detener y pedirlo.
- Ambigüedad de producto/seguridad/arquitectura sin respuesta → detener y preguntar solo eso.
