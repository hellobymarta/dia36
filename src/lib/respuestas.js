// Los errores que llegan hasta aquí son de Mongoose, y sus mensajes hablan de
// topologías, de timeouts y del nombre interno del campo. Los traduzco antes de
// devolverlos para que en pantalla se lea algo que se entienda.

export function errorDeServidor(error) {
  console.error(error);

  // Si algo se le escapa a mi validación, Mongoose lo para igual. Eso es culpa
  // de lo que se ha enviado, así que es un 400 y no un fallo del servidor.
  if (error?.name === 'ValidationError') {
    const mensajes = Object.values(error.errors || {}).map((uno) => uno.message);
    return Response.json(
      { error: mensajes.join(' ') || 'Los datos de la salida no son válidos.' },
      { status: 400 }
    );
  }

  return Response.json(
    { error: 'No se ha podido conectar con la base de datos. Inténtalo en un momento.' },
    { status: 503 }
  );
}

export const cuerpoNoEsJson = () =>
  Response.json({ error: 'El cuerpo de la petición no es JSON.' }, { status: 400 });

export const noExiste = () =>
  Response.json({ error: 'No hay ninguna salida con ese id.' }, { status: 404 });
