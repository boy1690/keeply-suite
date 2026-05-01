---
title: "Por qué tu cuadrilla sigue abriendo el plano de AutoCAD de la semana pasada"
description: "Son las 9:40 de la mañana, pasas por la oficina y el PM te muestra la revisión del jueves pasado: cambió la especificación del marco. Has estado en obra todos los días, nadie te avisó. El hormigón ya está colado. Una guía práctica del jefe de obra para el control de versiones de planos: sin herramientas nuevas para la cuadrilla, sin reformar el flujo, solo una manera de que cada revisión deje su propio rastro."
slug: "autocad-wrong-version-crew"
date: 2026-04-24
image: cover.svg
og_image: cover.png
categories:
  - Gestión de archivos
tags:
  - AutoCAD
  - Construcción
  - Control de versiones
  - Gestión de obra
---

Son las 9:40 de la mañana. Por fin pasas por la oficina y le enseñas al PM las fotos de obra de ayer mientras desplazas con el dedo: el tramo del colector pluvial donde ya se hormigonó, los marcos embebidos en la losa, listos para las rejillas.

El PM no dice nada. Abre un archivo en su mesa: `A-05_drain_0422_issued.dwg`.

"El marco está mal. El arquitecto lo revisó otra vez el jueves pasado."

Sientes esa caída en el pecho. La revisión del jueves pasado llegó a la oficina — Mike la recibió, la archivó en el servidor, no avisó a nadie. Tú has estado en obra todos los días. Nadie lo mencionó en la reunión del lunes. No tenías cómo saberlo.

Ese tramo ya está colado. Cambió la especificación del marco — eso significa picar el hormigón curado para sacar los marcos viejos, colocar los nuevos del tamaño correcto, volver a hormigonar los bordes y dejarlos curar. Dos días más en el cronograma. Otros oficios apilados detrás de ti, todos esperando.

Tú no le mandaste el archivo equivocado a la cuadrilla. Simplemente no sabías que el archivo había cambiado.

## Contenido

- ["¿Esa es la revisión del jueves pasado?"](#h2-1)
- [Antes del "issued-for-construction" hay muchos borradores. Y luego el arquitecto da marcha atrás](#h2-2)
- [La oficina lo sabe. La obra no](#h2-3)
- [Dale a tus planos su propia línea de tiempo](#h2-4)
- [Los únicos que no necesitan esto: la cuadrilla que instala desde planos impresos](#h2-5)

---

## "¿Esa es la revisión del jueves pasado?" {#h2-1}

Es la pregunta a la que el PM vuelve cuando algo no cuadra. La cuadrilla también la hace. No lo dicen con mala intención — solo quieren confirmar. El problema es que la mitad de las veces tú tampoco puedes responder enseguida.

Abres el portátil. La carpeta del proyecto tiene `A-05_drain_0418.dwg`, `A-05_drain_0422_issued.dwg`, `A-05_drain_0422_issued_revframe.dwg`. También está `A-05_drain_0420_avoidutility.dwg` que alguien dejó caer en el grupo de WhatsApp. Y el de principios de marzo, `A-05_drain_0315.dwg`, que nunca borraste porque a veces el arquitecto vuelve a un trazado anterior cuando un cambio no funciona.

Cinco nombres de archivo. Sabes que uno de ellos es por el que la cuadrilla está construyendo. Pero no recuerdas cuál.

Esto no es pereza, ni la tuya ni la de Mike. Es que la brecha entre "llega un plano nuevo a la oficina" y "la obra se entera" no la tiene asignada nadie. Resulta que tú eres la persona que está parada a ambos lados de esa brecha.

---

## Antes del "issued-for-construction" hay muchos borradores. Y luego el arquitecto da marcha atrás {#h2-2}

Pensarás: "Bueno, simplemente reviso cada vez que paso por la oficina." En teoría, claro. En la práctica se cae porque **los borradores se siguen acumulando antes de que algo se emita formalmente**.

Un detalle, desde el primer esquema hasta el issued-for-construction, pasa por muchas versiones. El propietario añade un comentario — revisión. La inspección en obra encuentra un conflicto con una instalación — revisión. El ingeniero estructural revisa — revisión. **Luego el arquitecto llega a la rev 5 y el propietario dice "en realidad el detalle del borde de la rev 2 era más limpio", así que vuelve atrás**. Abres la carpeta y ves seis archivos, dos casi idénticos — pero no sabes cuál es el que cuenta ahora mismo.

Si esperaras a que el arquitecto "finalice" todo antes de dejar que la cuadrilla empiece, el cronograma te aplastaría. Tres oficios están apilados detrás de este tramo. Cada día que retienes, quemas mano de obra, equipo y holgura. Así que la contrata principal asume el riesgo calculado — **avanza con la última versión vista**, apostando a que la próxima revisión no será drástica.

La mayoría de las veces la apuesta sale bien. A veces no. Esta semana es una de esas.

---

## La oficina lo sabe. La obra no {#h2-3}

El verdadero punto de quiebre es este: **llega un plano nuevo a la oficina, la obra no se entera y nadie cruza el mensaje al otro lado de la brecha**.

Del lado de la oficina, quien recibe el correo puede ser un asistente del PM, un administrativo u otro super. Su instinto cuando aterriza un archivo es "archivarlo bien" — carpeta, nombre, archivo. No siempre saben exactamente en qué anda la obra esa semana, y no siempre pueden decir de un vistazo si esta revisión es del tipo que hay que marcar de inmediato. Para ellos, archivado es hecho.

Del lado de la obra, tú estás afuera todos los días. Aunque pases por la oficina cada viernes para sincronizar, entre tu última revisión y la siguiente, el arquitecto pudo haber emitido dos revisiones y deshecho una. Lo encuentras si vas a buscar — pero **solo si tienes la disciplina de volver a revisar activamente**. No todos los supers lo hacen, y no todas las veces.

Del lado de la cuadrilla, ellos construyen con lo que tú les pasaste la última vez. No saben si hay un archivo más nuevo en la oficina. Y no deberían tener que saberlo — su trabajo es instalar según el plano, no rastrear versiones.

De esos tres hilos, **el que va de oficina a obra es el más fácil de soltar**. No porque alguien sea flojo. Porque ningún proceso obliga a esa línea a quedarse abierta. Un mensaje "se subió una versión nueva" en un grupo, si se pasa por alto, se pasa por alto para siempre.

---

## Dale a tus planos su propia línea de tiempo {#h2-4}

No tiene mucho misterio. Cuatro pasos.

**1. En el momento en que aterriza un archivo nuevo en la oficina, avisa a la obra — y espera el "recibido" de vuelta.** No "archivado y listo". **El traspaso solo se cierra cuando la persona en obra confirma de manera explícita**. Puede ser por WhatsApp, por Slack, por una llamada. La regla es: la obra tiene que confirmar por escrito. Sin confirmación, el traspaso no está completo.

**2. Antes de que cualquier revisión nueva sobrescriba a la anterior, guarda la anterior por separado.** Llámala `A-05_drain_0418_architect_rev3.dwg`, `A-05_drain_0422_architect_rev4.dwg`. Esto es **para cuando el arquitecto da marcha atrás** — todavía puedes mostrar exactamente cómo era la rev 3.

**3. Deja que la herramienta registre cada revisión automáticamente, y hazla visible para todos.** Aquí es donde las herramientas se hacen cargo de las partes que la disciplina no puede sostener. [Keeply](https://keeply.work) está hecho exactamente para esto. Cada guardado registra una versión automáticamente. Los archivos se quedan donde están — en tu carpeta de proyecto, justo donde tu equipo ya mira. **Mientras todos abran la misma bóveda compartida (normalmente el NAS de la empresa), todos ven la misma línea de tiempo** — en el momento en que la oficina deja un archivo nuevo, el super en obra abre su Keeply en el sitio y la línea de tiempo muestra "hoy 15:30, el arquitecto volvió a revisar". Aviso honesto: si necesitas comparar dos planos `.dwg` línea por línea, todavía tienes que abrir AutoCAD y hacerlo tú — Keeply no compara dibujos CAD. Pero "llegó una versión nueva, quién la mandó, cuándo, y ya la abriste?" — eso dejas de perdértelo. El PM pregunta "¿viste la rev del jueves pasado?" y la línea de tiempo lo responde.

Así se ve más o menos en pantalla:

```text
A-05_drain.dwg
Bóveda: Z:\Projects\MapleSt_Drainage\
─────────────────────────────────────────────

 Descripción de versión                  Etiqueta  Cuándo
─────────────────────────────────────────────
 ●  Especificación del marco revisada              Hoy
 ●  Redirigido para evitar instalación             04/20
 ●  Emitido tras revisión del propietario  ⭐Issued  04/18
 ●  Perfil ajustado                                04/15

─────────────────────────────────────────────
 Miembros de la bóveda (NAS compartido)
   Mike (oficina) · Tú (obra) · Chen (capataz)

   Todos abren la misma carpeta, todos ven
   la misma línea de tiempo. En el momento en
   que aterriza una versión nueva, aparece
   para todos. Pasa el cursor por cualquier
   fila → restaurar con un clic.
```

**4. Al menos una copia que no esté en esta máquina ni en el NAS de la obra.** Disco externo, nube, slot de respaldo — lo que sea. La idea es **al menos una copia fuera del sitio**. Los discos del NAS de la oficina fallan, se borran, se reasignan al siguiente proyecto. La copia fuera del sitio es el seguro más barato que vas a comprarte.

Los pasos 1 y 2 pueden funcionar solo con disciplina, pero seamos honestos — a los tres meses te perderás la mitad. El paso 3 es como la herramienta atrapa la otra mitad.

---

## Los únicos que no necesitan esto: la cuadrilla que instala desde planos impresos {#h2-5}

Seamos honestos — esto no es para todos en la construcción. Pero la lista de excepciones es más corta de lo que crees.

**Los únicos que de verdad no necesitan esto son los de la cuadrilla que instalan desde el plano que tienen en frente.** Su trabajo es construir según la lámina que se les pasó, no perseguir versiones. Perseguir versiones es tu trabajo.

**La obra pública en realidad lo necesita más, no menos.** Quizá supongas que los grandes proyectos públicos o gubernamentales están cubiertos porque ya tienen una plataforma de colaboración BIM. Es al revés. La obra pública corre con muchísimo más papeleo que los trabajos privados, las solicitudes de cambio se arrastran durante meses, hay más rotación de gestión, la pila de documentos crece más rápido y la memoria institucional se rompe más fácilmente. Las plataformas BIM resuelven el entregable final. No resuelven los documentos de planificación, los archivos compartidos ni las notas de revisión que los planos de diseño van acumulando en el proceso — y esas son las cosas que de verdad crecen, día tras día.

**Los autónomos también lo necesitan.** Pensarás: "Soy el único en este proyecto de principio a fin, ¿de verdad necesito control de versiones?" Sí. Porque dentro de tres meses, mirando el mismo archivo, **vas a olvidar por qué el tú del pasado hizo el cambio**. Una línea de tiempo guarda más que el archivo en sí — guarda la razón en ese momento. El tú del futuro le agradecerá al tú del presente haber dejado el rastro.

Todos los demás — residencial pequeño y mediano, comercial, interiorismo, drenaje, paisajismo, viales, trabajos de campus, obra pública, proyectos BIM, diseñadores autónomos, estudios de diseño — **si tu trabajo implica que un archivo se modifique y luego lo reabra otra persona o el tú del futuro, necesitas una línea de tiempo.** Cada vez que esa línea se rompe, el tiempo y el dinero se te van del bolsillo.

---

Un `.dwg` no es solo un dibujo. Es una instantánea de lo que el diseño, la oficina y la obra acordaron en un momento específico. Ese momento sigue cambiando, sigue traspasándose, sigue construyéndose desde la versión equivocada.

¿Vale la pena darle a cada uno de tus proyectos su propia línea de tiempo?

---

¿Te acuerdas de las 9:40 de la mañana — el PM mostrándote la revisión del jueves, y esa caída en el pecho? Ya no tienes que ser tú el gestor de versiones. **Keeply: la memoria guardiana de tus archivos.** Recuerda cada guardado, cada versión emitida, cada instantánea antes de que la anterior se sobrescriba. Vive dentro de tu carpeta de proyecto existente — sin herramientas nuevas, sin hábitos nuevos para la cuadrilla. La construcción encaja especialmente bien, porque la línea entre oficina y obra se rompe en cada proyecto.

[Conoce Keeply →](https://keeply.work)
