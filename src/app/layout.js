import Menu from '@/components/Menu';
import './globals.css';

export const metadata = {
  title: 'Vagamundo · Calendario de salidas',
  description: 'Calendario de salidas de Vagamundo, con su API y su base de datos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <Menu />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">{children}</main>
        <footer className="mx-auto w-full max-w-3xl px-6 pb-10">
          <p className="text-sm text-suave">Vagamundo · hola@vagamundo.es</p>
          <p className="text-sm text-suave">Práctica del día 36 · Desarrollo Web Fullstack</p>
        </footer>
      </body>
    </html>
  );
}
