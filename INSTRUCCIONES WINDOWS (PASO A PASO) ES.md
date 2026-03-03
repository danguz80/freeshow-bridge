INSTRUCCIONES WINDOWS (PASO A PASO) - FreeShow Bridge

====================================================



Objetivo

--------

Hacer correr el servidor "freeshow-bridge" en Windows para que FreeShow pueda mostrar

las canciones del proyecto activo en una diapositiva tipo Web/Browser.



Requisitos

----------

1\) Tener FreeShow instalado y abierto.

2\) Tener Internet para descargar Node.js (solo la primera vez).

3\) Tener permisos para instalar programas en Windows.



Paso 1: Instalar Node.js (una sola vez)

---------------------------------------

1\. Abre tu navegador y busca: "Node.js LTS download".

2\. Entra al sitio oficial de Node.js y descarga la versión LTS para Windows.

3\. Ejecuta el instalador (.msi) y deja todo por defecto:

&nbsp;  - Next → Next → Install → Finish



IMPORTANTE: Reinicia el PC si te lo pide.



Paso 2: Verificar que Node quedó instalado

------------------------------------------

1\. Abre el menú Inicio.

2\. Escribe: "cmd"

3\. Abre "Símbolo del sistema" (Command Prompt).

4\. Escribe estos comandos (uno por uno) y presiona Enter:



&nbsp;  node -v

&nbsp;  npm -v



Si aparecen números de versión (ej: v20.x.x), está OK.



Paso 3: Descargar el proyecto (2 opciones)

------------------------------------------



OPCIÓN A (recomendada): Descargar ZIP desde GitHub

1\. Entra al repositorio en GitHub.

2\. Haz clic en el botón verde "Code".

3\. Selecciona "Download ZIP".

4\. Descomprime el ZIP en una carpeta fácil, por ejemplo:

&nbsp;  C:\\freeshow-bridge\\



OPCIÓN B: Clonar con Git (solo si tienes Git instalado)

1\. Instala Git si no lo tienes.

2\. Abre CMD y ejecuta:

&nbsp;  git clone https://github.com/TU\_USUARIO/TU\_REPO.git



Paso 4: Abrir la carpeta del proyecto en CMD

--------------------------------------------

1\. Abre CMD (Símbolo del sistema).

2\. Escribe (ejemplo si lo dejaste en C:\\freeshow-bridge):



&nbsp;  cd C:\\freeshow-bridge



TIP: Puedes escribir "cd " (con espacio) y luego arrastrar la carpeta al CMD.



Paso 5: Instalar dependencias (solo la primera vez)

---------------------------------------------------

En la misma ventana CMD, ejecuta:



&nbsp;  npm install



Esto descargará las librerías necesarias. Puede tardar 1-2 minutos.



Paso 6: Iniciar el servidor

---------------------------

Ejecuta:



&nbsp;  node server.js



Si todo está OK, verás mensajes similares a:

\- "Bridge listo..."

\- "Conectado a FreeShow WebSocket"

\- URLs como http://localhost:3000/...



IMPORTANTE:

\- NO cierres esta ventana CMD mientras uses el bridge.

\- Si cierras CMD, el servidor se apaga.



Paso 7: Probar en el navegador

------------------------------

Abre Chrome/Edge y entra a una de estas URLs:



1\) Vista vertical:

&nbsp;  http://localhost:3000/songs



2\) Ticker solo Coro:

&nbsp;  http://localhost:3000/songs/ticker/coro      -----> (Ajusta "coro" según tus secciones que tengas en tu proyecto de Freeshow)



3\) Ticker solo Conjunto:

&nbsp;  http://localhost:3000/songs/ticker/conjunto  -----> (Ajusta "conjunto" según tus secciones que tengas en tu proyecto de Freeshow)



4\) Ticker ambos (1 línea):

&nbsp;  http://localhost:3000/songs/ticker



5\) Ticker ambos (2 líneas):

&nbsp;  http://localhost:3000/songs/ticker2



Si ves el listado moviéndose, está funcionando.



Paso 8: Usar en FreeShow (diapositiva tipo Web/Browser)

-------------------------------------------------------

**VISTA VERTICAL**



1\. Abre FreeShow.

2\. Crea una nueva presentación, dale un nombre tipo "Listado de ítems".

3\. Edita la presentación creada añadiendo un elemento "Web", y configura

&nbsp;  una salida específica, en este caso la salida de escenario.

4\. Pega la URL que quieres usar, por ejemplo:

&nbsp;  http://localhost:3000/songs

&nbsp;  Esta es la vista vertical, usa toda la pantalla, es útil cuando

&nbsp;  en la pantalla del público se está proyectando el logo por ejemplo,

&nbsp;  entonces en la del escenario se puede proyectar el listado.

5\. Sal del modo de edición y dale a "Borrar todo", con esto, al tener un 

&nbsp;  fondo configurado para la salida de pantalla del público, generalmente 

&nbsp;  el logo de la iglesia, ese logo se mostrará en esa pantalla, y ahí colocas 

&nbsp;  la presentación creada, "Listado de ítems", y se mostrará solo en la pantalla 

&nbsp;  del escenario, mientras en la del público se muestra el logo.



**VISTA DE TICKERS**



1\. Abre FreeShow.

2\. En Escenario crea o configura una plantilla.

3\. El uso pensado para los tickers es cuando en la pantalla de Escenario está 

&nbsp;  mostrando anuncios, o videos, entonces para que los músicos siempre puedan

&nbsp;  ver que ítems vienen a continuación en el programa, uno puede añadir algún

&nbsp;  ticker a esa plantilla, generalmente en la parte inferior, igual se verá lo

&nbsp;  que están proyectando pero en la parte inferior se verá este lienzo (Ticker)

&nbsp;  con la info de los ítems del proyecto, desplazándose en un loop infinito.

4\. En la plantilla en la que quieras ver algún ticker agrega un elemento Web,

&nbsp;  las URL's son:

&nbsp;	-  http://localhost:3000/songs/ticker/coro

&nbsp;	-  http://localhost:3000/songs/ticker/conjunto

&nbsp;	-  http://localhost:3000/songs/ticker

&nbsp;	-  http://localhost:3000/songs/ticker2



&nbsp;  La primera URL muestra los ítems dentro de la sección llamada "Coro", esto se

&nbsp;  puede cambiar según tus propias secciones configuradas en tu proyecto, el como

&nbsp;  está explicado en el Readme.me.



   La segunda URL muestra los ítems dentro de la sección llamada "Conjunto", esto se

   puede cambiar según tus propias secciones configuradas en tu proyecto, el como

   está explicado en el Readme.me.



   La tercera URL muestra los ítems de ambas secciones "Coro" y "Conjunto" 

&nbsp;  en una sola línea, esto se puede cambiar según tus propias secciones 

&nbsp;  configuradas en tu proyecto, el como está explicado en el Readme.me.



   La cuarta URL muestra los ítems de ambas secciones "Coro" y "Conjunto"

   en 2 líneas, esto se puede cambiar según tus propias secciones

   configuradas en tu proyecto, el como está explicado en el Readme.me.



Listo: ahora FreeShow mostrará el contenido dinámico del bridge.



Paso 9 (Opcional): Hacer que se inicie automáticamente con Windows (fácil)

---------------------------------------------------------------------------

Esta opción es útil si no quieres abrir CMD y ejecutar node cada vez.



OPCIÓN SIMPLE: Acceso directo en Inicio

1\. Abre el Bloc de Notas.

2\. Pega esto (ajusta la ruta si tu carpeta es diferente):



&nbsp;  cd /d C:\\freeshow-bridge

&nbsp;  node server.js



3\. Guarda el archivo como:

&nbsp;  iniciar-bridge.bat

&nbsp;  (IMPORTANTE: debe terminar en .bat)



4\. Presiona Windows + R

5\. Escribe:

&nbsp;  shell:startup

6\. Copia el archivo iniciar-bridge.bat dentro de esa carpeta.



Desde ahora, al iniciar Windows, el bridge se abrirá automáticamente.



Solución de problemas (lo más común)

------------------------------------



1\) No conecta a FreeShow:

\- Verifica que FreeShow esté ABIERTO.

\- En FreeShow revisa Settings → Connection y habilita el servidor remoto (API/WebSocket).

\- Asegúrate de que el puerto de FreeShow sea el correcto (por defecto 5505).



2\) "node" no se reconoce:

\- Node.js no quedó instalado o falta reiniciar.

\- Reinstala Node.js LTS.



3\) Página en blanco o no carga:

\- Asegúrate de haber ejecutado: node server.js

\- Prueba abrir: http://localhost:3000/songs



4\) Firewall de Windows:

\- Permite Node.js en el firewall si aparece el mensaje.

\- Asegura red "Privada" si estás en LAN.



Fin

---

Si necesitas soporte, revisa el README del repositorio o abre un Issue en GitHub.

