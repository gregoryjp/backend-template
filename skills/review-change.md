# Skill: review-change

## Cuándo usarla
Antes de cerrar cualquier cambio, para revisión independiente.

## Entradas obligatorias
- Diff (`git diff` o rango de commits).
- Spec/aceptación correspondiente.

## Archivos mínimos a leer
- El diff completo.
- `docs/ARCHITECTURE.md`.
- Spec de la funcionalidad.

## Pasos
1. Verificar que la aceptación está cubierta por tests reales.
2. Verificar límites de módulos y responsabilidades de capas.
3. Verificar transacciones y rollback donde aplique.
4. Ejecutar `npm run check`.
5. Emitir veredicto pass/block con hallazgos.

## Salida esperada
Informe de revisión con evidencia (comando, resultado) y hallazgos `file:line`.

## Verificaciones
- `npm run check` en verde.
- Evidencia registrada en `docs/STATE.md`.

## Condiciones para detenerse
- Sin capacidad de revisión independiente → marcar "revisión independiente: pendiente"; no certificar una autorrevisión.
- Un cambio posterior invalida la evidencia → re-ejecutar.
