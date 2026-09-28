# Skill: navigation-review

## Cuándo usarla
Cuando existe interfaz (web/móvil) y se van a crear o cambiar pantallas, antes de implementar (mapa) y antes de cerrar (verificación de recorridos).

## Entradas obligatorias
- Decisión de navegación (ADR) y el stack.
- Lista de pantallas/journeys a cubrir.

## Archivos mínimos a leer
- `docs/STANDARDS.md` §4, `docs/MOBILE_PROFILE.md`.
- El mapa de navegación existente (o el ADR de stack).

## Pasos
1. Definir/validar el mapa: arranque/restauración, flujo público/auth/privado, detalle, modales, entradas/salidas, deep links.
2. Verificar reglas: rutas y parámetros tipados, paso de identificadores, política de Atrás/gestos/cierre, logout sin retorno a privado, destino pendiente solo si válido/autorizado.
3. Verificar entradas directas a detalles sin asumir pantalla previa.
4. Comprobar que los guards de UI no sustituyen la autorización del backend.

## Salida esperada
Mapa actualizado + lista de hallazgos con pantalla/flujo afectado.

## Verificaciones
- Recorridos completos: atrás, logout, sesión expirada, entrada directa (cuando aplique).
- Sin pantallas duplicadas por pulsaciones repetidas.

## Condiciones para detenerse
- Más de un sistema de navegación sin ADR que lo justifique → detener y decidir uno.
- Backend no autoriza y solo la UI oculta una ruta → corregir backend primero.
