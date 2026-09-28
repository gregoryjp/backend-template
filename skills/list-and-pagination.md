# Skill: list-and-pagination

## Cuándo usarla
Al implementar o revisar cualquier listado potencialmente creciente (backend y/o interfaz).

## Entradas obligatorias
- Listado a implementar/revisar y sus filtros/orden.

## Archivos mínimos a leer
- `docs/STANDARDS.md` §5.
- El repositorio/controlador del módulo (backend) y la pantalla (interfaz).

## Pasos
1. Backend: paginación en la query de PostgreSQL; tamaño por defecto/máximo validados; orden determinista con desempate; filtros/orden por allowlist; autorización y aislamiento antes de paginar y contar.
2. Elegir cursor (feeds/grandes/cambiantes) o página/offset (numeradas), y documentar limitaciones ante cambios concurrentes.
3. Verificar índices coherentes con las queries.
4. Interfaz: carga inicial vs "cargando más"; vacío general vs "sin resultados"; error recuperable; fin de resultados; sin peticiones duplicadas; reset de paginación al cambiar filtros; ignorar respuestas antiguas; sin duplicados al combinar páginas; claves estables; debounce.

## Salida esperada
Listado con política documentada y contrato de respuesta.

## Verificaciones
- Test de paginación/orden/filtros en backend.
- No se promete vista inmutable sin estrategia que la garantice.

## Condiciones para detenerse
- Conteo total costoso no usado por la UI → no añadirlo.
- Listado pequeño y acotado: puede prescindir de paginación dejando el límite documentado.
