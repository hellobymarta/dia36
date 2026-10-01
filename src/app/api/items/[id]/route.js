import { buscar, actualizar, eliminar } from '@/models/repositorio';
import { validar, resumirErrores } from '@/lib/validacion';
import { errorDeServidor, cuerpoNoEsJson, noExiste } from '@/lib/respuestas';

export const dynamic = 'force-dynamic';

// En Next 16 params es una promesa y hay que esperarla. Escrito como params.id,
// sin await, salta un error de sync-dynamic-apis.

export async function GET(peticion, { params }) {
  const { id } = await params;

  try {
    const una = await buscar(id);
    return una ? Response.json(una) : noExiste();
  } catch (error) {
    return errorDeServidor(error);
  }
}

export async function PUT(peticion, { params }) {
  const { id } = await params;

  let cuerpo;

  try {
    cuerpo = await peticion.json();
  } catch {
    return cuerpoNoEsJson();
  }

  // Parcial: el formulario de editar manda solo los campos que se han tocado.
  const { valido, errores, limpio } = validar(cuerpo, { parcial: true });

  if (!valido) {
    return Response.json({ error: resumirErrores(errores), errores }, { status: 400 });
  }

  try {
    const una = await actualizar(id, limpio);
    return una ? Response.json(una) : noExiste();
  } catch (error) {
    return errorDeServidor(error);
  }
}

export async function DELETE(peticion, { params }) {
  const { id } = await params;

  try {
    const borrada = await eliminar(id);
    return borrada ? Response.json({ eliminado: true, id }) : noExiste();
  } catch (error) {
    return errorDeServidor(error);
  }
}
