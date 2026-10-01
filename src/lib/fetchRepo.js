// fetchRepo centraliza todas las llamadas a la API. En vez de repetir el fetch
// en cada sitio, con su comprobación de response.ok y su lectura del JSON, lo
// escribo una vez aquí.
//
// Leo el cuerpo como texto y luego intento convertirlo: si quien contesta no es
// mi API y devuelve HTML, con .json() saltaría un «Unexpected token '<'» que no
// dice nada de lo que pasa.
export async function fetchRepo(ruta, opciones = {}) {
  let respuesta;

  try {
    respuesta = await fetch(ruta, {
      headers: opciones.body ? { 'Content-Type': 'application/json' } : undefined,
      cache: 'no-store',
      ...opciones,
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch {
    // Aquí se cae cuando no hay red o el servidor no está levantado: fetch
    // rechaza antes de que haya respuesta que leer.
    throw new Error('No se ha podido contactar con el servidor.');
  }

  const texto = await respuesta.text();

  let datos = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    throw new Error(
      (datos && datos.error) || `La API respondió con un error ${respuesta.status}.`
    );
  }

  return datos;
}
