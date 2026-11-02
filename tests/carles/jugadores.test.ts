import '@angular/compiler';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ChangeDetectorRef, ElementRef, Injector, runInInjectionContext } from '@angular/core';
import { FormularioJugadorComponent } from '../../src/app/components/formulario-jugador/formulario-jugador.component';
import { NuevoJugadorComponent } from '../../src/app/components/nuevo-jugador/nuevo-jugador.component';
import { JugadoresService } from '../../src/app/services/jugadores.service';
import { AvisosService } from '../../src/app/services/avisos.service';
import { SubidaArchivoComponent } from '../../src/app/components/subida-archivo/subida-archivo.component';
import { ArchivosService } from '../../src/app/services/archivos.service';
import { readFileSync } from 'node:fs';
import { DatosJugador, Jugador } from '../../src/app/models/jugador.model';

const datos = (): DatosJugador => ({
  nombre: 'Carles',
  apellidos: 'Miguel',
  nacionalidad: 'España',
  descripcion: 'Jugador de prueba',
  dorsal: 0,
  posicion: 'Base',
  edad: 20,
  altura: 1.85,
  peso: 80,
  foto: 'https://ejemplo.test/foto.jpg',
  video: 'https://ejemplo.test/video.mp4',
  estadisticas: { puntos: 12.5, rebotes: 0, asistencias: 4.2 },
});
function formulario() {
  const f = new FormularioJugadorComponent();
  const dialogo = {
    open: false,
    showModal() {
      this.open = true;
    },
    close() {
      this.open = false;
    },
  };
  f.dialogo = new ElementRef(dialogo as HTMLDialogElement);
  f.abrir(null);
  return f;
}
function alta(crear: (d: DatosJugador) => Promise<string>) {
  const exitos: string[] = [],
    errores: string[] = [];
  const injector = Injector.create({
    providers: [
      { provide: JugadoresService, useValue: { crear } },
      {
        provide: AvisosService,
        useValue: { exito: (s: string) => exitos.push(s), error: (s: string) => errores.push(s) },
      },
      { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
    ],
  });
  const componente = runInInjectionContext(injector, () => new NuevoJugadorComponent());
  componente.formulario = formulario();
  return { componente, exitos, errores, injector };
}

test('el alta vacía exige todos los datos salvo foto y vídeo', () => {
  const f = formulario();
  for (const ruta of [
    'nombre',
    'apellidos',
    'nacionalidad',
    'descripcion',
    'posicion',
    'dorsal',
    'edad',
    'altura',
    'peso',
    'estadisticas.puntos',
    'estadisticas.rebotes',
    'estadisticas.asistencias',
  ]) {
    assert.ok(f.formulario.get(ruta)?.hasError('required'), ruta);
  }
  assert.ok(f.formulario.controls.foto.valid);
  assert.ok(f.formulario.controls.video.valid);
  let emisiones = 0;
  f.guardar.subscribe(() => emisiones++);
  f.enviar();
  assert.equal(emisiones, 0);
  assert.match(f.error('nombre'), /obligatorio/);
});

test('rechaza espacios, textos largos y posiciones ajenas al modelo', () => {
  const f = formulario();
  f.formulario.setValue(datos());
  for (const [ruta, max] of [
    ['nombre', 40],
    ['apellidos', 60],
    ['nacionalidad', 40],
    ['descripcion', 600],
    ['foto', 1000],
    ['video', 1000],
  ] as const) {
    const control = f.formulario.get(ruta)!;
    control.setValue('x'.repeat(max + 1));
    assert.ok(control.hasError('maxlength'), ruta);
    const base = 'https://ejemplo.test/';
    control.setValue(
      ruta === 'foto' || ruta === 'video' ? base + 'x'.repeat(max - base.length) : 'x'.repeat(max),
    );
    assert.ok(control.valid, ruta);
    if (ruta !== 'foto' && ruta !== 'video') {
      control.setValue('   ');
      assert.ok(control.invalid, ruta);
    }
  }
  f.formulario.controls.posicion.setValue('Otra' as any);
  assert.ok(f.formulario.controls.posicion.invalid);
});

test('valida límites, tipos, enteros y estadísticas anidadas', () => {
  const f = formulario();
  f.formulario.setValue(datos());
  for (const [ruta, min, max, soloEntero] of [
    ['dorsal', 0, 99, true],
    ['edad', 16, 50, true],
    ['altura', 1.5, 2.4, false],
    ['peso', 50, 180, false],
    ['estadisticas.puntos', 0, 60, false],
    ['estadisticas.rebotes', 0, 40, false],
    ['estadisticas.asistencias', 0, 30, false],
  ] as const) {
    const c = f.formulario.get(ruta)!;
    for (const invalido of [min - 1, max + 1, NaN, Infinity, '20']) {
      c.setValue(invalido);
      assert.ok(c.invalid, `${ruta}: ${invalido}`);
    }
    for (const valido of [min, max]) {
      c.setValue(valido);
      assert.ok(c.valid, `${ruta}: ${valido}`);
    }
    c.setValue(min + 0.25);
    assert.equal(c.valid, !soloEntero, ruta);
  }
});

test('edición precargada, conserva URL y no modifica el original', () => {
  const f = formulario();
  const jugador: Jugador = { id: 'original', ...datos() };
  const copia = structuredClone(jugador);
  f.abrir(jugador);
  assert.deepEqual(f.formulario.getRawValue(), datos());
  f.formulario.controls.estadisticas.controls.puntos.setValue(30);
  f.formulario.controls.nombre.setValue(' Nombre nuevo ');
  let salida: DatosJugador | undefined;
  f.guardar.subscribe((d) => (salida = d));
  f.enviar();
  assert.deepEqual(jugador, copia);
  assert.equal(salida?.nombre, 'Nombre nuevo');
  assert.equal(salida?.estadisticas.puntos, 30);
  assert.equal(salida?.foto, jugador.foto);
  assert.equal(salida?.video, jugador.video);
  assert.equal('id' in salida!, false);
  f.guardando = true;
  f.guardando = false;
  f.cerrar();
  f.abrir(null);
  assert.equal(f.formulario.controls.foto.value, '');
  assert.equal(f.formulario.controls.video.value, '');
  assert.equal(f.formulario.controls.nombre.value, '');
  assert.equal(f.formulario.touched, false);
});

test('bloquea envío y cierre durante cualquiera de las subidas o el guardado', () => {
  const f = formulario();
  f.formulario.setValue(datos());
  let emisiones = 0;
  f.guardar.subscribe(() => emisiones++);
  for (const estado of ['subiendoFoto', 'subiendoVideo', 'guardando'] as const) {
    f[estado] = true;
    f.enviar();
    f.cerrar();
    assert.equal(emisiones, 0);
    assert.equal(f.dialogo.nativeElement.open, true);
    const evento = new Event('cancel', { cancelable: true });
    f.cancelar(evento);
    assert.ok(evento.defaultPrevented);
    f[estado] = false;
  }
  f.enviar();
  assert.equal(emisiones, 1);
});

test('emite exactamente DatosJugador y frena el doble envío inmediato', () => {
  const f = formulario();
  f.formulario.setValue(datos());
  const emisiones: DatosJugador[] = [];
  f.guardar.subscribe((d) => emisiones.push(d));
  f.enviar();
  f.enviar();
  assert.deepEqual(emisiones, [datos()]);
  f.guardando = true;
  f.guardando = false;
  f.enviar();
  assert.equal(emisiones.length, 2);
});

test('alta usa crear una sola vez, muestra éxito y cierra al resolverse', async () => {
  let resolver!: (id: string) => void;
  let llamadas = 0;
  const prueba = alta(async (d) => {
    llamadas++;
    assert.deepEqual(d, datos());
    return new Promise<string>((r) => (resolver = r));
  });
  const c = prueba.componente;
  const pendiente = c.crearJugador(datos());
  await c.crearJugador(datos());
  assert.equal(llamadas, 1);
  assert.ok(c.guardando);
  assert.ok(c.formulario.guardando);
  assert.ok(c.formulario.dialogo.nativeElement.open);
  resolver('nuevo-id');
  await pendiente;
  assert.equal(c.guardando, false);
  assert.equal(c.formulario.guardando, false);
  assert.equal(c.formulario.dialogo.nativeElement.open, false);
  assert.equal(prueba.exitos.length, 1);
  assert.equal(prueba.errores.length, 0);
  prueba.injector.destroy();
});

test('ante error conserva datos, libera bloqueo y permite reintentar', async () => {
  let llamadas = 0;
  const prueba = alta(async () => {
    llamadas++;
    throw new Error('sin conexión');
  });
  const c = prueba.componente;
  c.formulario.formulario.setValue(datos());
  c.formulario.guardar.subscribe((d) => {
    void c.crearJugador(d);
  });
  c.formulario.enviar();
  await new Promise((r) => setImmediate(r));
  assert.equal(c.guardando, false);
  assert.equal(c.formulario.ocupado, false);
  assert.ok(c.formulario.dialogo.nativeElement.open);
  assert.deepEqual(c.formulario.formulario.getRawValue(), datos());
  assert.equal(prueba.errores.length, 1);
  assert.equal(prueba.exitos.length, 0);
  c.formulario.enviar();
  await new Promise((r) => setImmediate(r));
  assert.equal(llamadas, 2);
  prueba.injector.destroy();
});

test('las subidas simultáneas mantienen el bloqueo hasta terminar ambas', () => {
  const f = formulario();
  f.formulario.setValue(datos());
  let emisiones = 0;
  f.guardar.subscribe(() => emisiones++);
  f.subiendoFoto = true;
  f.subiendoVideo = true;
  f.subiendoFoto = false;
  f.enviar();
  assert.equal(emisiones, 0);
  f.subiendoVideo = false;
  f.enviar();
  assert.equal(emisiones, 1);
  assert.notEqual(f.idFormulario, formulario().idFormulario);
});

const referenciasValidas = {
  foto: [
    '',
    'https://res.cloudinary.com/equipo/image/upload/c_fill,w_300/v1/foto.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/a/ab/Foto.jpg',
    'https://cdn.ejemplo.test/imagen?firma=a%20b&ancho=200',
    'assets/img/jugadores/jugador-1.jpg',
    '/assets/img/jugadores/jugador-2.png',
    './assets/img/jugadores/jugador-3.webp',
  ],
  video: [
    '',
    'https://res.cloudinary.com/equipo/video/upload/v1/video.mp4',
    'https://cdn.ejemplo.test/videos/partido.webm',
    'https://cdn.ejemplo.test/reproducir?id=1',
    'assets/videos/jugador-1.mp4',
    '/assets/videos/jugador-2.webm',
    './assets/videos/jugador-3.mp4',
  ],
};

test('acepta vacíos, Cloudinary, otros orígenes HTTPS y rutas locales por tipo', () => {
  for (const campo of ['foto', 'video'] as const) {
    for (const referencia of referenciasValidas[campo]) {
      const f = formulario();
      f.formulario.setValue(datos());
      f.formulario.controls[campo].setValue(referencia);
      let salida: DatosJugador | undefined;
      f.guardar.subscribe((d) => (salida = d));
      f.enviar();
      assert.ok(f.formulario.valid, referencia);
      assert.equal(salida?.[campo], referencia);
    }
  }
});

test('rechaza referencias inválidas e impide emitir datos para guardarlas', () => {
  const invalidas = [
    'referencia-invalida',
    ' ',
    null,
    undefined,
    42,
    {},
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:image/png;base64,AAAA',
    'blob:https://ejemplo.test/id',
    'file:///foto.jpg',
    'ftp://ejemplo.test/a.jpg',
    'http://ejemplo.test/a.jpg',
    '//ejemplo.test/a.jpg',
    'https:/ejemplo.test/a.jpg',
    'https://',
    'https:///ejemplo.test/a.jpg',
    'https:////ejemplo.test/a.jpg',
    'https://?foto.jpg',
    'https://ejemplo..test/a.jpg',
    'https://ejemplo.test:puerto/a.jpg',
    'https://usuario:clave@ejemplo.test/a.jpg',
    'https://ejemplo.test/a b.jpg',
    'https://ejemplo.test/a%ZZ.jpg',
    'https://ejemplo.test/\\foto.jpg',
    'https://ejemplo.test/\nfoto.jpg',
    'https://ejemplo.test',
    'assets/../foto.jpg',
    '/etc/foto.jpg',
    'public/assets/videos/a.mp4',
    'assets/videos/../a.mp4',
    'assets/videos/%2e%2e/a.mp4',
    'assets/img/jugadores/a.svg',
  ];
  for (const campo of ['foto', 'video'] as const) {
    for (const referencia of invalidas) {
      const f = formulario();
      f.formulario.setValue(datos());
      f.formulario.controls[campo].setValue(referencia as any);
      let emisiones = 0;
      f.guardar.subscribe(() => emisiones++);
      f.enviar();
      assert.ok(f.formulario.controls[campo].hasError('referenciaMultimedia'), String(referencia));
      assert.equal(emisiones, 0);
      assert.match(f.error(campo), /Referencia no válida/);
    }
  }
  const f = formulario();
  f.formulario.controls.foto.setValue('assets/videos/jugador-1.mp4');
  f.formulario.controls.video.setValue('assets/img/jugadores/jugador-1.jpg');
  assert.ok(f.formulario.controls.foto.invalid);
  assert.ok(f.formulario.controls.video.invalid);
});

test('precarga y emite sin alterar las referencias válidas al editar', () => {
  for (let i = 0; i < referenciasValidas.foto.length; i++) {
    const f = formulario();
    const jugador = {
      id: 'editar',
      ...datos(),
      foto: referenciasValidas.foto[i],
      video: referenciasValidas.video[i],
    };
    const original = structuredClone(jugador);
    f.abrir(jugador);
    let salida: DatosJugador | undefined;
    f.guardar.subscribe((d) => (salida = d));
    f.enviar();
    assert.equal(salida?.foto, jugador.foto);
    assert.equal(salida?.video, jugador.video);
    assert.deepEqual(jugador, original);
  }
});

test('acepta todas las referencias de la plantilla inicial del repositorio', () => {
  const plantilla = JSON.parse(readFileSync('firebase/jugadores-iniciales.json', 'utf8'));
  // La fuente de datos tiene además documentación: localizamos la lista de jugadores.
  const jugadores = Array.isArray(plantilla) ? plantilla : plantilla.jugadores;
  assert.equal(jugadores.length, 10);
  for (const jugador of jugadores) {
    const f = formulario();
    f.formulario.controls.foto.setValue(jugador.foto);
    f.formulario.controls.video.setValue(jugador.video);
    assert.ok(f.formulario.controls.foto.valid, jugador.foto);
    assert.ok(f.formulario.controls.video.valid, jugador.video);
  }
});

// Enlaza los outputs reales de Marc a los controles como hace la plantilla, sin renderizarla.
// El servicio de archivos es siempre un doble: nunca hay peticiones a Cloudinary.
for (const tipo of ['foto', 'video'] as const) {
  for (const existente of [false, true]) {
    test(`subida ${tipo} fallida: conserva ${existente ? 'referencia anterior' : 'campo opcional vacío'} y libera bloqueo`, async () => {
      const f = formulario();
      const inicial = datos();
      if (!existente) inicial[tipo] = '';
      f.formulario.setValue(inicial);
      let rechazar!: (e: Error) => void;
      const injector = Injector.create({
        providers: [
          {
            provide: ArchivosService,
            useValue: {
              validar: () => null,
              subir: () => new Promise((_, reject) => (rechazar = reject)),
            },
          },
          { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
        ],
      });
      const subida = runInInjectionContext(injector, () => new SubidaArchivoComponent());
      subida.tipo = tipo;
      subida.url = inicial[tipo];
      subida.urlChange.subscribe((url) => f.formulario.controls[tipo].setValue(url));
      subida.subiendo.subscribe((estado) => {
        if (tipo === 'foto') f.subiendoFoto = estado;
        else f.subiendoVideo = estado;
      });
      let salida: DatosJugador | undefined;
      f.guardar.subscribe((d) => (salida = d));
      const pendiente = subida.alElegirArchivo({
        target: {
          files: [
            new File(['simulado'], 'archivo', {
              type: tipo === 'foto' ? 'image/jpeg' : 'video/mp4',
            }),
          ],
          value: '',
        },
      } as any);
      f.enviar();
      assert.equal(salida, undefined);
      assert.ok(f.ocupado);
      rechazar(new Error('Fallo de subida simulado'));
      await pendiente;
      assert.equal(subida.error, 'Fallo de subida simulado');
      assert.equal(f.ocupado, false);
      assert.equal(f.formulario.controls[tipo].value, inicial[tipo]);
      f.enviar();
      assert.deepEqual(salida, inicial);
      injector.destroy();
    });
  }
}

for (const tipo of ['foto', 'video'] as const) {
  for (const respuesta of [
    'https://res.cloudinary.com/equipo/' + tipo + '/upload/archivo',
    'referencia-invalida',
    undefined,
  ]) {
    test(`respuesta de subida ${tipo}: ${String(respuesta)}`, async () => {
      const f = formulario();
      f.formulario.setValue(datos());
      const injector = Injector.create({
        providers: [
          {
            provide: ArchivosService,
            useValue: { validar: () => null, subir: async () => respuesta },
          },
          { provide: ChangeDetectorRef, useValue: { markForCheck() {} } },
        ],
      });
      const subida = runInInjectionContext(injector, () => new SubidaArchivoComponent());
      subida.tipo = tipo;
      subida.url = f.formulario.controls[tipo].value;
      subida.urlChange.subscribe((url) => f.formulario.controls[tipo].setValue(url));
      subida.subiendo.subscribe((estado) => {
        if (tipo === 'foto') f.subiendoFoto = estado;
        else f.subiendoVideo = estado;
      });
      const pendiente = subida.alElegirArchivo({
        target: { files: [new File(['simulado'], 'archivo')], value: '' },
      } as any);
      let salida: DatosJugador | undefined;
      f.guardar.subscribe((d) => (salida = d));
      f.enviar();
      assert.equal(salida, undefined);
      await pendiente;
      f.enviar();
      if (respuesta?.startsWith('https://')) {
        assert.equal(salida?.[tipo], respuesta);
      } else {
        assert.equal(salida, undefined);
        assert.ok(f.formulario.controls[tipo].invalid);
        assert.match(f.error(tipo), /Referencia no válida/);
      }
      injector.destroy();
    });
  }
}
