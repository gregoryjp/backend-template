# Skill: form-and-mutation

## Cuándo usarla
Al implementar o revisar formularios y operaciones de escritura.

## Entradas obligatorias
- Formulario/operación y sus reglas de negocio.

## Archivos mínimos a leer
- `docs/STANDARDS.md` §6.
- Schemas de validación (Zod) y el servicio/controlador afectado.

## Pasos
1. Validación en cliente (ayuda) y en servidor (autoridad).
2. Errores por campo y generales comprensibles.
3. Conservar datos ante fallos recuperables; estado de envío y anti doble pulsación.
4. Teclado/autofill/contraseñas seguras; teclado sin tapar campos/acción.
5. Cambios sin guardar y confirmación de destructivas.
6. Protección backend frente a duplicados con consecuencias (constraints, transacciones, idempotencia).
7. No reintentar automáticamente escrituras que puedan duplicar.

## Salida esperada
Formulario/operación con estados y protecciones definidas; feedback claro.

## Verificaciones
- El servidor valida aunque el cliente falle.
- Caso de doble envío cubierto en backend.

## Condiciones para detenerse
- Operación duplicable sin protección backend → añadirla antes de cerrar.
