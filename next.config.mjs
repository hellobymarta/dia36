/** @type {import('next').NextConfig} */
const nextConfig = {
  // En la carpeta de arriba, la de todas las prácticas, hay otro
  // package-lock.json, y Next avisaba de que no sabía cuál era la raíz del
  // proyecto. Con esto le digo que la raíz es esta carpeta.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
