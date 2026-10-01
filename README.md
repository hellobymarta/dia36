# Día 36 — Proyecto práctico con Next.js

El calendario de salidas de **Vagamundo**: una aplicación de Next con su propia
API y sus datos en MongoDB Atlas. Desde la página del calendario se listan las
salidas, se añaden, se corrigen y se retiran.

**Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + Mongoose 9.**

- En funcionamiento: https://dia36-kappa.vercel.app
- Repositorio: https://github.com/hellobymarta/dia36

## Cómo ejecutarlo

```bash
npm install
cp .env.example .env.local   # y dentro pongo mi cadena de Atlas
npm run comprobar-db         # comprueba que la conexión va
npm run sembrar              # mete tres salidas de ejemplo
npm run dev
```

Y abro http://localhost:3000.

Sin `.env.local` también arranca: en ese caso trabaja con una lista en memoria,
que es como estaba en el nivel 1. Sirve para probar la pantalla, pero lo que se
guarde se pierde al reiniciar.

## Las páginas y la API

| Ruta         | Qué hace                                       |
| -------------- | ------------------------------------------------ |
| `/`            | La portada: qué es esto y qué endpoints tiene   |
| `/salidas`     | El calendario: listar, añadir, editar y borrar  |

| Endpoint            | Método   | Qué hace                  |
| --------------------- | ---------- | --------------------------- |
| `/api/items`          | `GET`      | Devuelve todas las salidas |
| `/api/items`          | `POST`     | Crea una salida            |
| `/api/items/:id`      | `GET`      | Devuelve una sola          |
| `/api/items/:id`      | `PUT`      | Corrige una salida         |
| `/api/items/:id`      | `DELETE`   | La retira del calendario   |

Una salida tiene destino, país, fecha, plazas y precio.

---

## Nivel 1 — El proyecto y el CRUD en memoria

El proyecto está creado con `npx create-next-app`, con App Router, Tailwind y la
carpeta `src`.

El CRUD entero vive en dos archivos de API: `api/items/route.js` para lo que
afecta a la colección (`GET` y `POST`) y `api/items/[id]/route.js` para lo que
afecta a una salida concreta (`GET`, `PUT` y `DELETE`). Los corchetes de la
carpeta marcan la parte variable de la dirección.

En Next 16 el `id` llega en `params`, que es una promesa:

```js
export async function PUT(peticion, { params }) {
  const { id } = await params;
  ...
}
```

Escrito como `params.id`, sin `await`, salta un error de *sync-dynamic-apis*.

La página `/salidas` lo consume: pide la lista al cargar, tiene el formulario
para añadir y, en cada fila, los botones de editar y eliminar.

## Nivel 2 — La base de datos

Los datos están en un cluster de MongoDB Atlas, en la base de datos
`vagamundo_salidas`. La cadena de conexión va en `.env.local`, que no se sube a
GitHub; en el repositorio solo está `.env.example` con la forma que tiene.

### Lo que hubo que cambiar

Nada de las rutas ni de la página. Todo el acceso a los datos estaba ya
separado en `src/models/repositorio.js`, así que el cambio de la lista en
memoria a Mongo se hizo solo ahí dentro.

```js
export async function listar() {
  if (!hayBaseDeDatos()) return [...enMemoria].sort(porFecha);

  await conectar();
  const salidas = await Salida.find().sort({ fecha: 1 });
  return salidas.map((una) => una.toJSON());
}
```

Dejé el array como recambio a propósito: si no hay `MONGODB_URI`, la aplicación
arranca igual y se puede enseñar la pantalla funcionando.

### La conexión

`src/lib/db.js`. En Vercel cada petición puede despertar una función nueva, así
que guardo la conexión en una variable global: si ya está abierta la reutilizo,
y si se está abriendo espero a esa misma promesa en vez de abrir otra. Sin eso,
con unas cuantas peticiones seguidas se agotan las conexiones del cluster. Es la
misma solución que usé en la API del día 32.

### El esquema

`src/models/Salida.js`. Al pasar a JSON cambio `_id` por `id` y quito el `__v`,
para que la página no tenga que saber cómo guarda las cosas Mongo:

```js
esquema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
  },
});
```

Con esto, la página trata igual una salida que venga de Mongo que una que venga
del array.

## Nivel 3 — Validación, errores y despliegue

### Validación

`src/lib/validacion.js`, en un solo sitio para que el `POST` y el `PUT`
comprueben lo mismo. El `PUT` valida en modo parcial, porque el formulario de
editar manda solo los campos que se han tocado.

| Situación                        | Código | Lo que se lee en pantalla        |
| ---------------------------------- | -------- | ---------------------------------- |
| Todo bien                         | `200`    |                                   |
| Creada                            | `201`    | «… ya está en el calendario»      |
| Falta un campo o está mal         | `400`    | «Escribe el destino», etc.        |
| No hay ninguna salida con ese id  | `404`    | «No hay ninguna salida con ese id»|
| La base de datos no contesta      | `503`    | «No se ha podido conectar…»       |

Mongoose también valida, porque el esquema lleva `required`, `min` y `max`, pero
sus mensajes vienen en inglés y con el nombre interno del campo. Comprobando
antes puedo devolver un aviso que se entienda al leerlo. Si algo se me escapa y
salta igualmente, `src/lib/respuestas.js` lo reconoce como `ValidationError` y lo
devuelve como 400, no como error del servidor.

### La pantalla

- Mientras llega la lista se lee «Cargando el calendario…».
- Los botones se quedan en «Guardando…» o «Eliminando…» mientras esperan, y no
  se pueden pulsar dos veces.
- Después de cada operación sale un aviso, verde o rojo, que se va solo a los
  cuatro segundos.
- Si la lista no llega, sale el error con un botón de **Reintentar** en vez de
  una pantalla en blanco.
- Al eliminar, la fila desaparece antes de que conteste la API y vuelve a su
  sitio si la API falla, para que la lista responda al instante.

### El despliegue

Está en https://dia36-kappa.vercel.app, con el repositorio de GitHub conectado:
cada push a `main` lo vuelve a desplegar. La variable `MONGODB_URI` se configura
ahí (*Settings → Environment Variables*), nunca en el repositorio.
Vercel lee las variables al construir, así que después de añadirla o cambiarla
hay que volver a desplegar.

En Atlas, *Network Access* tiene que dejar entrar a las funciones de Vercel, que
no tienen una IP fija.

## Estructura

```
dia36/
├── .env.example
├── package.json
├── scripts/
│   ├── comprobar-db.mjs     ← prueba la conexión con Atlas
│   └── sembrar.mjs          ← mete tres salidas de ejemplo
└── src/
    ├── app/
    │   ├── layout.js
    │   ├── page.js               ← la portada
    │   ├── salidas/page.js       ← el calendario
    │   ├── not-found.js
    │   └── api/
    │       ├── items/route.js        ← GET y POST
    │       └── items/[id]/route.js   ← GET, PUT y DELETE
    ├── components/
    │   ├── Menu.js
    │   └── GestorSalidas.js      ← la pantalla del CRUD
    ├── lib/
    │   ├── db.js                 ← la conexión con Atlas
    │   ├── fetchRepo.js          ← las llamadas a la API, centralizadas
    │   ├── validacion.js         ← las reglas de los campos
    │   └── respuestas.js         ← los errores, traducidos
    └── models/
        ├── Salida.js             ← el esquema de Mongoose
        └── repositorio.js        ← el acceso a los datos
```
