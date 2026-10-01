// Mete tres salidas de ejemplo en la base de datos, para no empezar con el
// calendario vacío. Si ya hay salidas guardadas, no toca nada.

import mongoose from 'mongoose';
import Salida from '../src/models/Salida.js';

const SALIDAS = [
  { destino: 'Fiordos del oeste', pais: 'Islandia', fecha: '2026-06-12', plazas: 12, precio: 2450 },
  { destino: 'Wadi Rum y Petra', pais: 'Jordania', fecha: '2026-10-03', plazas: 10, precio: 1980 },
  { destino: 'Ruta de Kumano', pais: 'Japón', fecha: '2027-04-18', plazas: 8, precio: 3120 },
];

if (!process.env.MONGODB_URI) {
  console.error('Falta MONGODB_URI. Copia .env.example como .env.local y pon tu cadena de Atlas.');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });

  const cuantas = await Salida.countDocuments();

  if (cuantas > 0) {
    console.log(`Ya hay ${cuantas} salidas guardadas, no añado nada.`);
  } else {
    await Salida.insertMany(SALIDAS);
    console.log('Añadidas', SALIDAS.length, 'salidas.');
  }
} catch (error) {
  console.error('No ha salido bien:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
