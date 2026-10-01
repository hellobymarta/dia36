import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <p className="etiqueta">Vagamundo</p>
        <h1 className="titular text-4xl sm:text-5xl">El calendario de salidas</h1>
        <p className="max-w-xl text-suave">
          Vagamundo organiza viajes en grupo pequeño. Aquí dentro está el calendario de salidas:
          qué destino, qué día sale, cuántas plazas quedan y a qué precio. Desde la página del
          calendario se añaden, se corrigen y se retiran.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-borde bg-hueso p-6">
        <p className="etiqueta">La API</p>
        <ul className="flex flex-col gap-1 text-sm">
          <li>
            <code>GET /api/items</code> · el calendario entero
          </li>
          <li>
            <code>POST /api/items</code> · añadir una salida
          </li>
          <li>
            <code>PUT /api/items/:id</code> · corregir una salida
          </li>
          <li>
            <code>DELETE /api/items/:id</code> · retirarla
          </li>
        </ul>
        <p className="text-sm text-suave">
          Las salidas se guardan en MongoDB Atlas a través de Mongoose.
        </p>
      </section>

      <Link
        href="/salidas"
        className="self-start rounded-lg bg-tinta px-5 py-3 text-sm text-crema transition hover:bg-acento"
      >
        Ir al calendario
      </Link>
    </div>
  );
}
