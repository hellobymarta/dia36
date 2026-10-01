import mongoose from 'mongoose';

// La conexión con Atlas, igual que la del día 32.
//
// En Vercel cada petición puede despertar una función nueva, así que guardo la
// conexión en una variable global: si ya está abierta la reutilizo, y si está
// abriéndose espero a esa misma promesa en vez de abrir otra. Sin esto, con
// unas cuantas peticiones seguidas se agotan las conexiones del cluster.

let cacheada = globalThis.__mongoose;

if (!cacheada) {
  cacheada = globalThis.__mongoose = { conexion: null, promesa: null };
}

export function hayBaseDeDatos() {
  return Boolean(process.env.MONGODB_URI);
}

export async function conectar() {
  if (cacheada.conexion) return cacheada.conexion;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Falta MONGODB_URI.');
  }

  if (!cacheada.promesa) {
    cacheada.promesa = mongoose
      .connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 8000 })
      .then((conexion) => {
        cacheada.conexion = conexion;
        return conexion;
      })
      .catch((fallo) => {
        // Si falla borro la promesa, para que el siguiente intento vuelva a
        // probar en vez de quedarse con el error guardado para siempre.
        cacheada.promesa = null;
        throw fallo;
      });
  }

  return cacheada.promesa;
}
