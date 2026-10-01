// Valido aquí y no dentro de cada método de la API, para que el POST y el PUT
// comprueben exactamente lo mismo y los mensajes se escriban una sola vez.
//
// Mongoose también valida (el esquema tiene required, min y max), pero sus
// mensajes vienen en inglés y con el nombre interno del campo. Comprobando
// antes puedo devolver un aviso que se entienda al leerlo.

const HOY = () => new Date().toISOString().slice(0, 10);

export const CAMPOS = ['destino', 'pais', 'fecha', 'plazas', 'precio'];

const esTexto = (valor) => typeof valor === 'string' && valor.trim().length > 0;

export function validar(cuerpo = {}, { parcial = false } = {}) {
  const errores = {};
  const limpio = {};

  const toca = (campo) => !parcial || cuerpo[campo] !== undefined;

  if (toca('destino')) {
    if (!esTexto(cuerpo.destino)) errores.destino = 'Escribe el destino.';
    else if (cuerpo.destino.trim().length > 80) errores.destino = 'El destino es demasiado largo.';
    else limpio.destino = cuerpo.destino.trim();
  }

  if (toca('pais')) {
    if (!esTexto(cuerpo.pais)) errores.pais = 'Escribe el país.';
    else limpio.pais = cuerpo.pais.trim();
  }

  if (toca('fecha')) {
    const fecha = typeof cuerpo.fecha === 'string' ? cuerpo.fecha.trim() : '';

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) {
      errores.fecha = 'La fecha tiene que ser un día válido.';
    } else if (fecha < HOY()) {
      errores.fecha = 'La salida no puede ser anterior a hoy.';
    } else {
      limpio.fecha = fecha;
    }
  }

  if (toca('plazas')) {
    const plazas = Number(cuerpo.plazas);

    if (cuerpo.plazas === '' || cuerpo.plazas === null || cuerpo.plazas === undefined) {
      errores.plazas = 'Escribe cuántas plazas hay.';
    } else if (!Number.isInteger(plazas) || plazas < 1 || plazas > 30) {
      errores.plazas = 'Las plazas van de 1 a 30.';
    } else {
      limpio.plazas = plazas;
    }
  }

  if (toca('precio')) {
    const precio = Number(cuerpo.precio);

    if (cuerpo.precio === '' || cuerpo.precio === null || cuerpo.precio === undefined) {
      errores.precio = 'Escribe el precio.';
    } else if (!Number.isFinite(precio) || precio < 0) {
      errores.precio = 'El precio no puede ser negativo.';
    } else {
      limpio.precio = Math.round(precio);
    }
  }

  if (parcial && Object.keys(limpio).length === 0 && Object.keys(errores).length === 0) {
    errores.general = 'No has cambiado ningún campo.';
  }

  return { valido: Object.keys(errores).length === 0, errores, limpio };
}

// Un solo texto con todo lo que está mal, que es lo que pinta la página.
export function resumirErrores(errores) {
  return Object.values(errores).join(' ');
}
