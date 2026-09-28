# Skill: screen-states

## Cuándo usarla
Al definir o revisar pantallas; asegura que cada estado aplicable esté previsto y compartido.

## Entradas obligatorias
- Pantalla(s) y sus datos/permisos/conectividad.

## Archivos mínimos a leer
- `docs/STANDARDS.md` §7.
- La pantalla y los componentes de estado compartidos.

## Pasos
1. Enumerar estados aplicables: carga inicial, contenido, vacío (con acción útil), error (con recuperación), sin conexión, actualización en segundo plano, sin permisos, sesión expirada.
2. Usar componentes/criterios visuales compartidos.
3. Verificar accesibilidad: etiquetas, foco, contraste, áreas táctiles, movimiento reducido, texto ampliado.
4. Mensajes útiles sin exponer errores internos.

## Salida esperada
Inventario de estados por pantalla + componentes compartidos.

## Verificaciones
- Cada pantalla define sus estados aplicables.
- No se declara accesibilidad verificada solo por inspección estática.

## Condiciones para detenerse
- Estado que expone error interno o dato sensible → corregir antes de continuar.
