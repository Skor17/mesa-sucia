# Chiste Local

Quiero que desarrolles un juego de cartas online inspirado en el estilo de juegos de humor negro y políticamente incorrecto como “Con Eso No Se Jode”, pero sin copiar cartas, textos, nombres, diseño ni contenido protegido del juego original.

Concepto

Un juego social de cartas para 2 o más jugadores, pensado para jugar online mientras están en llamada/Discord. Tiene que ser rápido, caótico, gracioso y especialmente adaptado al humor argentino.

La idea principal es que los jugadores reciban situaciones, preguntas o frases y tengan que responder/combinar cartas de forma absurda, incómoda o de humor negro. El objetivo es hacer reír al resto y conseguir puntos.

Público y tono

Humor argentino.

Humor negro, absurdo, ácido e incómodo.

Mucho lunfardo y referencias culturales argentinas.

Puede tocar temas sensibles de manera satírica, pero el objetivo es el humor, no atacar o promover odio contra personas o grupos.

Que se sienta como una juntada de amigos argentinos a las 2 AM.

Evitar humor demasiado infantil o genérico.

No quiero que parezca un juego corporativo, educativo ni “family friendly”.

El humor debe ser inesperado y tener remates fuertes.

Gameplay

Tiene que funcionar completamente dentro de la web/app. Ningún jugador debe tener que hacer cosas en la vida real.

No quiero:

retos físicos

tomar alcohol

mostrar la cámara

salir de la casa

llamar a alguien

mandar mensajes reales

comprar cosas

hacer pruebas físicas

utilizar objetos externos

Todo tiene que resolverse mediante interacción digital dentro del juego.

Modos

Implementá como mínimo:

1. Duelo 1v1
Dos jugadores compiten directamente.

2. Grupo
3-10 jugadores aproximadamente.

3. Partida rápida
Entrar, crear sala, compartir código/link y empezar.

Mecánica principal

Cada ronda:

Se presenta una situación/pregunta/frase.

Cada jugador recibe varias cartas de respuesta.

Los jugadores eligen una respuesta en secreto.

Se revelan todas simultáneamente.

Los jugadores votan la respuesta que consideran más graciosa.

Se otorgan puntos.

Cambia el jugador que presenta la siguiente situación.

Después de varias rondas se muestra el ganador.

Quiero que explores también mecánicas adicionales que hagan el juego más divertido, por ejemplo:

cartas comodín

respuestas combinables

eventos aleatorios

votaciones especiales

rondas temáticas

cartas que cambien las reglas temporalmente

“todos contra uno”

apuestas de puntos

respuestas que permitan modificar una carta

rondas de velocidad

No agregues mecánicas que hagan que la partida sea demasiado complicada.

Multiplayer

La experiencia multiplayer es una prioridad.

Quiero:

Crear sala.

Código de sala.

Link para invitar amigos.

Nombre/avatar de jugador.

Estado “listo”.

Lobby.

Indicador de quién está conectado.

Reconexión si alguien pierde conexión.

Que la partida continúe aunque alguien tenga una conexión momentáneamente inestable.

Sincronización en tiempo real.

Que nadie pueda ver las cartas privadas de otro jugador.

Evitar que un jugador pueda enviar dos respuestas o votar dos veces.

Manejar correctamente que un jugador abandone durante una partida.

Interfaz

Diseño moderno, oscuro y divertido.

Inspiración visual:

cartas físicas

bares/juntadas argentinas

estética ligeramente caótica

tipografía grande

animaciones rápidas

colores contrastantes

humor visual

Pero no copies el diseño de ningún juego existente.

La interfaz debe ser excelente tanto en:

PC

celular

tablet

Contenido

Creá inicialmente un conjunto grande de contenido para poder jugar inmediatamente.

Quiero aproximadamente:

150+ cartas de situaciones/preguntas

300+ cartas de respuesta

30+ cartas especiales

El contenido debe estar escrito específicamente para argentinos y no sentirse como traducción de un juego extranjero.

Ejemplos del tipo de tono que busco:

Situación:

“El verdadero motivo por el que Milei renunció fue…”

Respuesta:

“Descubrió que también había que pagar impuestos.”

Situación:

“La peor cosa que podés encontrar en el grupo familiar de WhatsApp es…”

Respuesta:

“Un audio de 7 minutos que empieza con ‘muchachos, no quiero generar polémica’.”

Estos son solamente ejemplos del tono. No copies estos ejemplos literalmente como contenido final; generá contenido original.

Contenido dinámico

Quiero que el sistema permita agregar fácilmente nuevas cartas sin modificar el código principal.

Separá el contenido del juego de la lógica.

Por ejemplo:

cards/
prompts.json
responses.json
special.json

o una estructura equivalente.

Moderación

Implementá un sistema básico para:

reportar una carta

ocultar cartas

marcar contenido como demasiado ofensivo

permitir que el creador de una sala active/desactive determinadas categorías

Categorías opcionales:

política

religión

famosos

sexo

drogas

muerte

violencia

Argentina

fútbol

relaciones

trabajo

universidad

No quiero que el sistema elimine automáticamente todo el humor negro. La idea es permitir humor adulto, pero evitar contenido que directamente promueva odio contra grupos protegidos o instrucciones para cometer delitos.

Tecnología

Elegí un stack moderno y simple de desplegar.

Preferentemente:

Frontend: React / Next.js

Backend: Node.js

Multiplayer: WebSockets / Socket.IO

Base de datos: PostgreSQL o una alternativa sencilla

Deploy sencillo y barato

Si considerás que otro stack es claramente mejor para este proyecto, explicá brevemente por qué antes de implementarlo.

Arquitectura

Separá claramente:

frontend

backend

game engine

multiplayer state

database

card/content system

El servidor debe ser la autoridad sobre:

estado de la partida

cartas privadas

turnos

votos

puntos

ganador

No confíes en el cliente para validar acciones importantes.

Flujo de usuario

Inicio:
→ “Crear partida”
→ elegir cantidad de jugadores
→ elegir categorías
→ crear código
→ compartir link
→ lobby
→ todos listos
→ comenzar

Durante partida:
→ prompt
→ selección privada
→ revelar
→ votar
→ resultados
→ siguiente ronda

Final:
→ ranking
→ estadísticas
→ botón “Jugar otra”
→ botón “Nueva sala”

Estadísticas

Al finalizar mostrar:

ganador

puntos

cartas más votadas

jugador más votado

cantidad de rondas ganadas

alguna estadística absurda generada a partir de la partida

Importante

No quiero solamente un mockup.

Quiero un MVP funcional completo, donde pueda abrir dos o más navegadores/dispositivos, entrar a la misma sala y jugar realmente una partida multiplayer.

Primero:

Diseñá la arquitectura.

Explicá brevemente las decisiones técnicas.

Implementá el backend.

Implementá el frontend.

Implementá el sistema multiplayer.

Implementá el contenido inicial.

Probá el flujo completo.

Corregí errores.

Dejá instrucciones claras para ejecutar localmente.

Prepará el proyecto para poder desplegarlo online.

Priorizá que el juego sea realmente divertido y jugable antes que agregar funciones innecesarias.

El resultado final debe sentirse como un juego que un grupo de argentinos puede abrir desde un link, compartir por Discord y empezar a jugar en menos de un minuto.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mesa-sucia.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/827dd4d8-e7a8-4208-b7e8-e95f4ddee17c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
