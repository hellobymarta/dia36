import GestorSalidas from '@/components/GestorSalidas';

export const metadata = {
  title: 'Calendario · Vagamundo',
};

export default function Salidas() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="etiqueta">Calendario</p>
        <h1 className="titular text-4xl">Salidas programadas</h1>
      </section>

      <GestorSalidas />
    </div>
  );
}
