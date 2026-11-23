#!/usr/bin/env node
/**
 * Simula LOCALMENTE lo que hace Squash AUTOM / OpenTestFactory al ejecutar un caso de prueba:
 *   1. Interpreta el campo "Automated test reference":  [repo]/[carpeta]#[archivo_spec]#[test]
 *   2. Lanza el mismo comando `playwright test` (con --grep y --reporter=html,junit)
 *   3. Lee pw_junit_report.xml y calcula el estado que Squash TM mostraría (Éxito / Fallo / Bloqueado)
 *
 * Uso:
 *   node scripts/simular-squash.mjs "<referencia>" [CLAVE=valor ...]
 *
 * Ejemplos:
 *   node scripts/simular-squash.mjs "squash-playwright-demo/tests/auth#login.spec.ts#AUTH-01"
 *   node scripts/simular-squash.mjs "squash-playwright-demo/tests/params#parametros.spec.ts#PAR-01" \
 *        DS_USUARIO=admin DS_PASSWORD=mal DS_RESULTADO=ERROR DSNAME=DS-clave-incorrecta
 *
 * Las variables CLAVE=valor se pasan como variables de entorno, igual que hace Squash con
 * los parámetros del dataset (DS_*), TC_REFERENCE, TC_UUID y los campos personalizados (TC_CUF_*).
 */
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const [, , referencia, ...extra] = process.argv;
if (!referencia) {
  console.error('Uso: node scripts/simular-squash.mjs "<referencia>" [CLAVE=valor ...]');
  process.exit(2);
}

// ---------- 1. Interpretar la referencia ----------
const partes = referencia.split('#');
if (partes.length < 2 || partes.length > 3) {
  console.error(`Referencia inválida: debe tener 1 o 2 caracteres '#' -> [repo]/[carpeta]#[archivo]#[test]`);
  process.exit(2);
}
const [rutaBase, archivoSpec, grep] = partes;
// El orquestador clona el repo en una carpeta con su nombre; aquí ya estamos dentro del repo,
// así que se descarta el primer segmento (nombre del repositorio).
const segmentos = rutaBase.split('/').filter(Boolean);
const repo = segmentos.shift();
const carpeta = segmentos.join('/');
const filtroArchivo = [carpeta, archivoSpec].filter(Boolean).join('/');

// ---------- 2. Preparar entorno y comando ----------
const env = {
  ...process.env,
  PW_TEST_HTML_REPORT_OPEN: 'never',
  PLAYWRIGHT_HTML_REPORT: 'playwright-report',
  PLAYWRIGHT_JUNIT_OUTPUT_NAME: 'pw_junit_report.xml',
};
for (const par of extra) {
  const i = par.indexOf('=');
  if (i > 0) env[par.slice(0, i)] = par.slice(i + 1);
}

const require = createRequire(import.meta.url);
const cli = require.resolve('@playwright/test/cli');
const args = [cli, 'test', filtroArchivo];
if (grep) args.push(`--grep=${grep}`);
args.push('--reporter=html,junit');
if (env.PLAYWRIGHT_EXTRA_OPTIONS) {
  // En Linux Squash NO admite espacios en esta variable: se emula la restricción.
  if (process.platform !== 'win32' && /\s/.test(env.PLAYWRIGHT_EXTRA_OPTIONS)) {
    console.error('✖ PLAYWRIGHT_EXTRA_OPTIONS contiene espacios: el orquestador en Linux no lo soporta.');
    console.error('  Use la forma --opcion=valor sin espacios (p. ej. --config=ruta/config.ts).');
    process.exit(2);
  }
  args.push(...env.PLAYWRIGHT_EXTRA_OPTIONS.split(/\s+/).filter(Boolean));
}

console.log(`Repositorio : ${repo}`);
console.log(`Comando     : npx playwright test ${filtroArchivo}${grep ? ` --grep="${grep}"` : ''} --reporter=html,junit`);
const claves = extra.map((e) => e.split('=')[0]);
if (claves.length) console.log(`Variables   : ${claves.join(', ')}`);
console.log('─'.repeat(70));

rmSync('pw_junit_report.xml', { force: true });
const r = spawnSync(process.execPath, args, { env, stdio: 'inherit' });

// ---------- 3. Leer JUnit y calcular el estado ----------
console.log('─'.repeat(70));
if (!existsSync('pw_junit_report.xml')) {
  console.log('Estado Squash TM : BLOQUEADO  (no se generó pw_junit_report.xml)');
  process.exit(1);
}
const xml = readFileSync('pw_junit_report.xml', 'utf8');
const cuenta = (re) => (xml.match(re) || []).length;
const total = cuenta(/<testcase\b/g);
const omitidos = cuenta(/<skipped\b/g);
const fallos = cuenta(/<failure\b/g);
const errores = cuenta(/<error\b/g);
const ok = total - fallos - errores - omitidos;

let estado;
if (total === 0) estado = 'BLOQUEADO (suposición: ningún test coincide con la referencia, no hay resultados que publicar)';
else if (errores > 0) estado = 'BLOQUEADO (hay tests con error técnico)';
else if (fallos > 0) estado = 'FALLO (hay tests con fallo funcional)';
else estado = 'ÉXITO';

console.log(`Tests: ${total} · pasaron: ${ok} · fallos: ${fallos} · errores técnicos: ${errores} · omitidos: ${omitidos}`);
console.log(`Estado Squash TM : ${estado}`);
console.log(`Evidencias       : pw_junit_report.xml · playwright-report/index.html`);
process.exit(r.status ?? 1);
