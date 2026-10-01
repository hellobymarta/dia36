// Comprueba que la cadena de conexión funciona: se conecta, crea una salida de
// prueba, la lee, la corrige y la borra.

import mongoose from 'mongoose';
import Salida from '../src/models/Salida.js';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Falta MONGODB_URI. Copia .env.example como .env.local y pon tu cadena de Atlas.');
  process.exit(1);
}

// La cadena lleva la contraseña dentro, así que enseño solo el final.
console.log('Base de datos:', uri.split('/').pop().split('?')[0] || '(sin nombre en la cadena)');

try {
  await mongoose.connect(uri, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
  console.log('Conectada.');

  const cuantas = await Salida.countDocuments();
  console.log('Salidas guardadas ahora mismo:', cuantas);

  const prueba = await Salida.create({
    destino: 'Prueba de conexión',
    pais: 'Ninguno',
    fecha: '2030-01-01',
    plazas: 1,
    precio: 0,
  });
  console.log('Creada la de prueba con id', prueba.id);

  await Salida.findByIdAndUpdate(prueba.id, { precio: 1 }, { returnDocument: 'after' });
  console.log('Corregida.');

  await Salida.findByIdAndDelete(prueba.id);
  console.log('Borrada. Todo en orden.');
} catch (error) {
  console.error('\nNo ha salido bien:', error.message);
  console.error('\nLo más habitual: la IP no está en la lista de Atlas, o el usuario o la contraseña no son los de la cadena.');
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
