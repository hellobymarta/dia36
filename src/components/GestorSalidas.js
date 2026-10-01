'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchRepo } from '@/lib/fetchRepo';

const VACIO = { destino: '', pais: '', fecha: '', plazas: '', precio: '' };

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Formateo la fecha a mano en vez de con toLocaleDateString: esa función usa el
// idioma y la zona horaria de quien la ejecuta, y en el día 33 me dejó el HTML
// del servidor distinto al del navegador.
const enTexto = (fecha) => {
  const [anio, mes, dia] = fecha.split('-');
  return `${Number(dia)} de ${MESES[Number(mes) - 1]} de ${anio}`;
};

const enEuros = (cantidad) =>
  `${String(cantidad).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} €`;

export default function GestorSalidas() {
  const [salidas, setSalidas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState(null);

  const [nueva, setNueva] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [borrador, setBorrador] = useState(VACIO);
  const [ocupadaId, setOcupadaId] = useState(null);

  const pedirSalidas = () =>
    fetchRepo('/api/items')
      .then(setSalidas)
      .catch((fallo) => setError(fallo.message))
      .finally(() => setCargando(false));

  const reintentar = () => {
    setCargando(true);
    setError('');
    pedirSalidas();
  };

  useEffect(() => {
    pedirSalidas();
  }, []);

  // El aviso de «guardada» o «eliminada» se va solo a los cuatro segundos.
  useEffect(() => {
    if (!aviso) return undefined;
    const reloj = setTimeout(() => setAviso(null), 4000);
    return () => clearTimeout(reloj);
  }, [aviso]);

  const resumen = useMemo(() => {
    const plazas = salidas.reduce((suma, una) => suma + una.plazas, 0);
    return { salidas: salidas.length, plazas };
  }, [salidas]);

  const anadir = async (evento) => {
    evento.preventDefault();
    setGuardando(true);
    setAviso(null);

    try {
      const creada = await fetchRepo('/api/items', { method: 'POST', body: nueva });
      setSalidas((antes) => [...antes, creada].sort((a, b) => a.fecha.localeCompare(b.fecha)));
      setNueva(VACIO);
      setAviso({ tipo: 'bien', texto: `${creada.destino} ya está en el calendario.` });
    } catch (fallo) {
      setAviso({ tipo: 'mal', texto: fallo.message });
    } finally {
      setGuardando(false);
    }
  };

  const abrirEdicion = (salida) => {
    setEditandoId(salida.id);
    setBorrador({
      destino: salida.destino,
      pais: salida.pais,
      fecha: salida.fecha,
      plazas: String(salida.plazas),
      precio: String(salida.precio),
    });
  };

  const guardarEdicion = async (id) => {
    setOcupadaId(id);
    setAviso(null);

    try {
      const actualizada = await fetchRepo(`/api/items/${id}`, { method: 'PUT', body: borrador });
      setSalidas((antes) =>
        antes
          .map((una) => (una.id === id ? actualizada : una))
          .sort((a, b) => a.fecha.localeCompare(b.fecha))
      );
      setEditandoId(null);
      setAviso({ tipo: 'bien', texto: 'Cambios guardados.' });
    } catch (fallo) {
      setAviso({ tipo: 'mal', texto: fallo.message });
    } finally {
      setOcupadaId(null);
    }
  };

  const borrar = async (salida) => {
    setOcupadaId(salida.id);
    setAviso(null);

    // Quito la fila antes de que conteste la API y la devuelvo a su sitio si
    // falla, para que la lista responda al instante.
    const copia = salidas;
    setSalidas((antes) => antes.filter((una) => una.id !== salida.id));

    try {
      await fetchRepo(`/api/items/${salida.id}`, { method: 'DELETE' });
      setAviso({ tipo: 'bien', texto: `${salida.destino} se ha eliminado.` });
    } catch (fallo) {
      setSalidas(copia);
      setAviso({ tipo: 'mal', texto: fallo.message });
    } finally {
      setOcupadaId(null);
    }
  };

  const campo =
    'w-full rounded-lg border border-borde bg-hueso px-3 py-2 text-sm outline-none transition focus:border-suave';
  const boton =
    'rounded-lg border border-borde px-3 py-1.5 text-sm transition hover:border-suave/60 disabled:opacity-50';

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={anadir} className="flex flex-col gap-4 rounded-lg border border-borde bg-hueso p-6">
        <p className="etiqueta">Nueva salida</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={campo}
            placeholder="Destino"
            value={nueva.destino}
            onChange={(e) => setNueva({ ...nueva, destino: e.target.value })}
          />
          <input
            className={campo}
            placeholder="País"
            value={nueva.pais}
            onChange={(e) => setNueva({ ...nueva, pais: e.target.value })}
          />
          <input
            className={campo}
            type="date"
            aria-label="Fecha de salida"
            value={nueva.fecha}
            onChange={(e) => setNueva({ ...nueva, fecha: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              className={campo}
              type="number"
              placeholder="Plazas"
              value={nueva.plazas}
              onChange={(e) => setNueva({ ...nueva, plazas: e.target.value })}
            />
            <input
              className={campo}
              type="number"
              placeholder="Precio"
              value={nueva.precio}
              onChange={(e) => setNueva({ ...nueva, precio: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={guardando}
            className="rounded-lg bg-tinta px-5 py-2 text-sm text-crema transition hover:bg-acento disabled:opacity-50"
          >
            {guardando ? 'Guardando…' : 'Añadir salida'}
          </button>

          {salidas.length > 0 && (
            <p className="text-sm text-suave">
              {resumen.salidas} salidas · {resumen.plazas} plazas en total
            </p>
          )}
        </div>
      </form>

      {aviso && (
        <p
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            aviso.tipo === 'bien'
              ? 'border-borde bg-hueso text-tinta'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {aviso.texto}
        </p>
      )}

      {cargando && <p className="text-sm text-suave">Cargando el calendario…</p>}

      {error && !cargando && (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-700">{error}</p>
          <button type="button" onClick={reintentar} className={boton}>
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && salidas.length === 0 && (
        <p className="text-sm text-suave">Todavía no hay salidas en el calendario.</p>
      )}

      {!cargando && !error && salidas.length > 0 && (
        <ul className="flex flex-col gap-3">
          {salidas.map((salida) => (
            <li key={salida.id} className="rounded-lg border border-borde bg-hueso p-5">
              {editandoId === salida.id ? (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className={campo}
                      aria-label="Destino"
                      value={borrador.destino}
                      onChange={(e) => setBorrador({ ...borrador, destino: e.target.value })}
                    />
                    <input
                      className={campo}
                      aria-label="País"
                      value={borrador.pais}
                      onChange={(e) => setBorrador({ ...borrador, pais: e.target.value })}
                    />
                    <input
                      className={campo}
                      type="date"
                      aria-label="Fecha"
                      value={borrador.fecha}
                      onChange={(e) => setBorrador({ ...borrador, fecha: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className={campo}
                        type="number"
                        aria-label="Plazas"
                        value={borrador.plazas}
                        onChange={(e) => setBorrador({ ...borrador, plazas: e.target.value })}
                      />
                      <input
                        className={campo}
                        type="number"
                        aria-label="Precio"
                        value={borrador.precio}
                        onChange={(e) => setBorrador({ ...borrador, precio: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => guardarEdicion(salida.id)}
                      disabled={ocupadaId === salida.id}
                      className={boton}
                    >
                      {ocupadaId === salida.id ? 'Guardando…' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setEditandoId(null)} className={boton}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="etiqueta">{salida.pais}</p>
                    <p className="titular text-xl">{salida.destino}</p>
                    <p className="text-sm text-suave">
                      {enTexto(salida.fecha)} · {salida.plazas} plazas · {enEuros(salida.precio)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => abrirEdicion(salida)} className={boton}>
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => borrar(salida)}
                      disabled={ocupadaId === salida.id}
                      className={`${boton} hover:text-acento`}
                    >
                      {ocupadaId === salida.id ? 'Eliminando…' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
