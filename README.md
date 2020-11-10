# niceGDL
App movil sobre ranking de lugares de interes.

Aplicación móvil con el objetivo de gestionar los lugares de interés que los usuarios publiquen y reseñen sobre la ciudad de Guadalajara.
Donde podremos encontrar secciones como : 

-Lugares publicados y su información detallada. 
-Favoritos( si es que el usuario ya esta registrado). 
-Los mejores 5 lugares (basado en las mejores puntuaciones de todos los lugares publicados a la fecha). 
-Buscador dentro de la aplicación. 
-Cuenta ( donde podrá gestionar su información y cambiar su nombre de usuario, foto de perfil, email y contraseña).

------------------- INSTRUCCIONES DE USO -------------------------------

Si desea ejecutar el proyecto tenga en cuenta lo siguiente:

-Asegurese de tener instalado: Node.js, expo y expo cli, un emulador de movil tales como xcode(ios) o android studio(android).
-use el terminal y acceda al directorio donde coloco el proyecto, una vez dentro ejecute el comando: $ npm install


-Asegurese de tener un proyecto de firebase creado, ya que necesitara agregar los datos de su propia base de datos.
-Ahora entre al la siguiente ruta: *niceGDL/app/utils/*  y dentro de *utils* cree un fichero con el nombre *firebase.js* 
-Dentro de *firebase.js* coloque la informacion de configuracion de su proyecto de firebase. 
-Tambien es necesario hacer las importaciones y exportaciones mostradas en el ejemplo:

-----------------

import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "suApiKey",
  authDomain: "SuDominio",
  databaseURL: "dbURL",
  projectId: "SuIdDeProyecto",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

export { firebase, auth, db };

--------------------

-Una vez que alla concluido con los pasos anteriores , solo queda iniciar su emulador movil,
usar la terminal y entrar en el directorio de su proyecto
-Ahora ejecute el comando: $ expo start
-Esto abrira un servidor/localhost en su navegador. 
-seleccione la pestaña que diga: iniciar app en emulador ios/android segun sea su emulador.
-Listo ya podra hacer uso de la app.
