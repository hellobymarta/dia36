import { conectar, hayBaseDeDatos } from '@/lib/db';
import Salida from '@/models/Salida';

// Todo el acceso a los datos pasa por aquí. Las rutas de la API llaman a estas
// funciones y no saben de dónde salen las salidas: empecé con el array de abajo
// y al pasar a Mongo solo tuve que cambiar este archivo.
//
// Dejo el array para cuando no hay MONGODB_URI, así el proyecto arranca y se
// puede probar la pantalla aunque no esté la base de datos. Lo que se guarde
// ahí se pierde al reiniciar.

const SEMILLA = [
  { id: '1', destino: 'Fiordos del oeste', pais: 'Islandia', fecha: '2026-06-12', plazas: 12, precio: 2450 },
  { id: '2', destino: 'Wadi Rum y Petra', pais: 'Jordania', fecha: '2026-10-03', plazas: 10, precio: 1980 },
  { id: '3', destino: 'Ruta de Kumano', pais: 'Japón', fecha: '2027-04-18', plazas: 8, precio: 3120 },
];

let enMemoria = SEMILLA.map((una) => ({ ...una }));
let siguienteId = SEMILLA.length + 1;

const porFecha = (a, b) => a.fecha.localeCompare(b.fecha);

export function origen() {
  return hayBaseDeDatos() ? 'mongodb' : 'memoria';
}

export async function listar() {
  if (!hayBaseDeDatos()) return [...enMemoria].sort(porFecha);

  await conectar();
  const salidas = await Salida.find().sort({ fecha: 1 });
  return salidas.map((una) => una.toJSON());
}

export async function buscar(id) {
  if (!hayBaseDeDatos()) return enMemoria.find((una) => una.id === String(id)) || null;

  await conectar();

  // Con un id que no tiene la forma de un ObjectId, findById lanza un
  // CastError en vez de devolver null. Lo compruebo antes.
  if (!mongoIdValido(id)) return null;

  const una = await Salida.findById(id);
  return una ? una.toJSON() : null;
}

export async function crear(datos) {
  if (!hayBaseDeDatos()) {
    const nueva = { id: String(siguienteId++), ...datos };
    enMemoria.push(nueva);
    return nueva;
  }

  await conectar();
  const nueva = await Salida.create(datos);
  return nueva.toJSON();
}

export async function actualizar(id, datos) {
  if (!hayBaseDeDatos()) {
    const una = enMemoria.find((otra) => otra.id === String(id));
    if (!una) return null;
    Object.assign(una, datos);
    return una;
  }

  await conectar();
  if (!mongoIdValido(id)) return null;

  const una = await Salida.findByIdAndUpdate(id, datos, {
    returnDocument: 'after',
    runValidators: true,
  });

  return una ? una.toJSON() : null;
}

export async function eliminar(id) {
  if (!hayBaseDeDatos()) {
    const antes = enMemoria.length;
    enMemoria = enMemoria.filter((una) => una.id !== String(id));
    return enMemoria.length < antes;
  }

  await conectar();
  if (!mongoIdValido(id)) return false;

  const borrada = await Salida.findByIdAndDelete(id);
  return Boolean(borrada);
}

function mongoIdValido(id) {
  return /^[0-9a-fA-F]{24}$/.test(String(id));
}
