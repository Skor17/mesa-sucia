# Completar el juego de cartas online

## Objetivo
Entregar un MVP jugable de punta a punta para 2 a 10 personas, manteniendo la dirección visual oscura “Neon Bar Chaos” y llevando el contenido a un humor más picante, ácido y reconociblemente argentino.

## Contenido
- Revisar situaciones y respuestas para reemplazar remates genéricos por lunfardo, costumbres, lugares y miserias cotidianas argentinas.
- Mantener contenido adulto y provocador, bloqueando odio contra grupos protegidos e instrucciones delictivas.
- Agregar al menos 30 cartas especiales originales: voto doble, apuesta, todos contra uno, respuesta combinada, velocidad, temática y cambios temporales de regla.
- Mantener prompts, respuestas y especiales separados de la lógica del juego.

## Partida online
- Crear sala con modo, cantidad máxima, rondas y categorías activables.
- Entrar por código o enlace, elegir nombre/avatar, marcarse listo y mostrar conexión/reconexión.
- Implementar el ciclo completo: repartir manos privadas, seleccionar una sola respuesta, revelar juntas, votar una vez, puntuar, rotar presentador y avanzar rondas.
- Resolver empates, abandonos, expiración de fases, reconexión y final de partida desde el servidor.
- Impedir que el navegador pueda consultar manos ajenas o alterar votos, puntos y turnos.

## Pantallas
- Inicio con crear/unirse.
- Configuración de sala y categorías.
- Lobby con participantes y estados.
- Mesa de juego con consigna, temporizador, mano privada, revelación y votación.
- Resultados de ronda y ranking final con ganador, puntos, rondas ganadas y estadísticas absurdas.
- Acciones “Jugar otra” y “Nueva sala”.

## Dirección visual
- Bar argentino nocturno: fondos carbón, verde neón, rojo de cartel y amarillo gastado.
- Cartas físicas imperfectas, tipografía grande, sellos, cinta y pequeños movimientos rápidos.
- Diseño primero para celular, adaptado a tablet y escritorio, sin perder legibilidad ni estabilidad.

## Verificación
- Probar el recorrido real con dos sesiones independientes en la misma sala.
- Comprobar selección privada, revelación, voto único, puntaje, siguiente ronda, reconexión y cierre.
- Revisar visualmente celular y escritorio y corregir errores visibles o de consola.
- Actualizar las instrucciones para ejecutar y publicar.

## Decisiones técnicas
- TanStack Start para interfaz y funciones del servidor.
- Lovable Cloud para persistencia; acceso directo bloqueado y acciones importantes validadas en servidor.
- Sincronización mediante consultas breves y actualización inmediata después de cada acción, compatible con el entorno de publicación actual.
