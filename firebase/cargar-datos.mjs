// Carga la plantilla inicial (10 jugadores) en la colección «jugadores» de Cloud Firestore.
//
//   npm run datos:cargar                 → carga los 10 jugadores si la colección está vacía
//   npm run datos:cargar -- --reiniciar  → borra todos los jugadores y vuelve a cargar los 10
//
// Usa el mismo SDK, la misma configuración y las mismas reglas de seguridad que la aplicación.
import { readFile } from 'node:fs/promises';
import { initializeApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  terminate,
} from 'firebase/firestore';
import { environment } from '../src/environments/environment.ts';

const reiniciar = process.argv.includes('--reiniciar');
const { jugadores } = JSON.parse(
  await readFile(new URL('./jugadores-iniciales.json', import.meta.url), 'utf8'),
);

const db = getFirestore(initializeApp(environment.firebase));
const coleccion = collection(db, 'jugadores');

const existentes = await getDocs(coleccion);
if (!existentes.empty && !reiniciar) {
  console.log(`La colección ya tiene ${existentes.size} jugadores: no se carga nada.`);
  console.log('Para volver a la plantilla inicial: npm run datos:cargar -- --reiniciar');
  await terminate(db);
  process.exit(0);
}

for (const documento of existentes.docs) {
  await deleteDoc(documento.ref);
}
if (!existentes.empty) console.log(`Borrados ${existentes.size} jugadores.`);

// Uno a uno y en orden: la fecha de creación del servidor mantiene el orden de la plantilla
for (const { id, fuentes, ...datos } of jugadores) {
  await setDoc(doc(coleccion, id), {
    ...datos,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  console.log(`  ${id.padStart(2)} · ${datos.nombre} ${datos.apellidos}`);
}

console.log(
  `Cargados ${jugadores.length} jugadores en Firestore (${environment.firebase.projectId}).`,
);
await terminate(db);
