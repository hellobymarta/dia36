import mongoose from 'mongoose';

const esquema = new mongoose.Schema(
  {
    destino: { type: String, required: true, trim: true, maxlength: 80 },
    pais: { type: String, required: true, trim: true, maxlength: 60 },
    fecha: { type: String, required: true },
    plazas: { type: Number, required: true, min: 1, max: 30 },
    precio: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

// Al convertir a JSON cambio _id por id y quito el __v, para que la página no
// tenga que saber cómo guarda las cosas Mongo.
esquema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (documento, salida) => {
    salida.id = salida._id.toString();
    delete salida._id;
  },
});

export default mongoose.models.Salida || mongoose.model('Salida', esquema);
