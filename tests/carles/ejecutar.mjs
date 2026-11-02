// Pruebas de lógica de componentes, sin navegador ni servicios externos.
// Ejecutar con Node 24: node tests/carles/ejecutar.mjs
import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await mkdir('tmp/pruebas-carles', { recursive: true });
await build({
  entryPoints: ['tests/carles/jugadores.test.ts'],
  outfile: 'tmp/pruebas-carles/jugadores.test.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  plugins: [
    {
      name: 'componentes-sin-vista',
      setup(b) {
        b.onLoad({ filter: /\.component\.ts$/ }, async ({ path }) => {
          const { readFile } = await import('node:fs/promises');
          // No se renderizan plantillas: la compilación Angular comprueba las vistas reales.
          const contents = (await readFile(path, 'utf8'))
            .replace(/templateUrl: '[^']*'/g, "template: ''")
            .replace(/styleUrl: '[^']*',?/g, '');
          return { contents, loader: 'ts' };
        });
      },
    },
  ],
});
const resultado = spawnSync(process.execPath, ['--test', 'tmp/pruebas-carles/jugadores.test.mjs'], {
  stdio: 'inherit',
});
process.exitCode = resultado.status ?? 1;
