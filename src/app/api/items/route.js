import { listar, crear, origen } from '@/models/repositorio';
import { validar, resumirErrores } from '@/lib/validacion';
import { errorDeServidor, cuerpoNoEsJson } from '@/lib/respuestas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const salidas = await listar();
    return Response.json(salidas, { headers: { 'X-Origen-Datos': origen() } });
  } catch (error) {
    return errorDeServidor(error);
  }
}

export async function POST(peticion) {
  let cuerpo;

  try {
    cuerpo = await peticion.json();
  } catch {
    return cuerpoNoEsJson();
  }

  const { valido, errores, limpio } = validar(cuerpo);

  if (!valido) {
    return Response.json({ error: resumirErrores(errores), errores }, { status: 400 });
  }

  try {
    const nueva = await crear(limpio);
    return Response.json(nueva, { status: 201 });
  } catch (error) {
    return errorDeServidor(error);
  }
}
