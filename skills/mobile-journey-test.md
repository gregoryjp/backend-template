# Skill: mobile-journey-test

## Cuándo usarla
Antes de declarar soporte móvil; prueba recorridos completos representativos.

## Entradas obligatorias
- Recorrido representativo y entorno (emulador/dispositivo).

## Archivos mínimos a leer
- `docs/STANDARDS.md` §4 y §8, `docs/MOBILE_PROFILE.md`.
- El mapa de navegación.

## Pasos
1. Recorrido principal: login → listado paginado → detalle → volver conservando contexto → logout.
2. Casos: error de red (no confundir con lista vacía), estados vacíos, permisos denegados, sesión expirada, entrada directa a detalle.
3. Verificar atrás/gestos/cierre y que logout no permita volver a contenido privado.
4. Registrar evidencia real (no estática).

## Salida esperada
Informe de recorridos con resultados y evidencia.

## Verificaciones
- Recorrido completo y casos negativos cubiertos.
- Sin pantallas incorrectas al restaurar sesión.

## Condiciones para detenerse
- Sin emulador/dispositivo/proveedor → registrar como pendiente; no inventar resultados ni cerrar el módulo completo.
