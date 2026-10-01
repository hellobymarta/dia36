'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ENLACES = [
  { href: '/', texto: 'Inicio' },
  { href: '/salidas', texto: 'Calendario' },
];

export default function Menu() {
  const ruta = usePathname();

  return (
    <header className="border-b border-borde bg-hueso">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="etiqueta">Viajes en grupo pequeño</p>
          <Link href="/" className="titular text-2xl">
            Vagamundo
          </Link>
        </div>

        <nav className="flex gap-5">
          {ENLACES.map((enlace) => (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`etiqueta border-b pb-1 transition ${
                ruta === enlace.href
                  ? 'border-tinta text-tinta'
                  : 'border-transparent hover:text-tinta'
              }`}
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
