# Configuración de Squash TM + Squash AUTOM para este proyecto

> Los nombres de menús pueden variar levemente según la versión de Squash TM. Ante dudas, la fuente de verdad es la documentación oficial (ver "Fuentes" al final).

## 0. Antes de tocar Squash: probar localmente

```bash
npm install
npx playwright install chromium        # una vez
npm run test:estables                  # 27 tests, deben pasar todos
node scripts/simular-squash.mjs "squash-playwright-demo/tests/auth#login.spec.ts#AUTH-01"
```

El simulador ejecuta el mismo comando que el orquestador y calcula el estado que Squash mostraría. Si una referencia no funciona aquí, tampoco funcionará en Squash.

## 1. Repositorio Git

1. Sube esta carpeta a un repositorio Git accesible por el runner. **El nombre del repositorio debe ser `squash-playwright-demo`** (o cambia el prefijo de todas las referencias, ver `referencias-automatizadas.csv`).
2. Si el repo es privado, prepara un usuario/token de solo lectura.

## 2. Runner (entorno de ejecución)

Una máquina Linux/Windows con:

```bash
node -v                                  # 18, 20 o superior
npm install -g playwright
npx playwright install --with-deps       # navegadores
pip install --upgrade opentf-agent       # Python 3.8+
```

Registra el agente contra el orquestador (las etiquetas deben incluir el sistema operativo y la tecnología):

```bash
opentf-agent --tags linux,playwright --host http://<orquestador> --token <TOKEN>
```

En Windows: `chcp 65001` antes y `--tags windows,playwright`. Si el puerto del canal de agentes no es el predeterminado, añade `--port`.

## 3. Squash Orchestrator (OpenTestFactory)

Imagen oficial "all-in-one" (puertos 7774 receptionist, 7775 observer, 7776 killswitch, 38368 eventbus, 24368 agentchannel):

```bash
docker pull squashtest/squash-orchestrator:latest
```

El comando `docker run` completo (claves de confianza, token, volúmenes) está en la guía oficial de instalación; no lo copio aquí porque cambia entre versiones. Requisitos: que el orquestador alcance la URL de Squash TM y que el runner alcance el orquestador.

## 4. Squash TM

**Plugins** (Administración → Plugins; se instalan como cualquier plugin de Squash TM): *Squash AUTOM* y *Result Publisher* (hay versión Community gratuita).

**Administración**

1. *Servidores de automatización*: crear uno de tipo `squashAutom` con la URL del orquestador. Define un **token** (Squash exige alguno aunque el orquestador no pida autenticación).
2. *Servidores de gestión de código fuente*: crear el servidor Git y dentro el repositorio `squash-playwright-demo`.
3. (Opcional) *Campos personalizados* de tipo texto para casos de prueba, con códigos `BASE_URL` y `TIMEOUT_MS`; asócialos al proyecto.

**Proyecto "Demo Playwright"**

1. Crear el proyecto y asociarle el servidor de automatización y el de código fuente.
2. Importar casos: *Test cases → Importar → Excel* con `importar-casos-de-prueba.xlsx` (crea 30 casos con pasos, parámetros y datasets). Si cambias el nombre del proyecto, edita la columna `TC_PATH`/`TC_OWNER_PATH`. Si el import rechaza filas por carpetas inexistentes, crea las carpetas antes.
3. **El Excel no trae la automatización**: por cada caso, en el bloque *Automatización* del caso:
   - Tecnología: `Playwright`
   - Repositorio: `squash-playwright-demo`
   - Referencia: copiar de `referencias-automatizadas.csv` (30 filas).
4. Crear una campaña con iteraciones, por ejemplo:
   - *Iteración Smoke*: AUTH-01, TODO-01, REG-01, API-01.
   - *Iteración Regresión*: todos los casos de las carpetas Autenticación, Tareas, Registro y API.
   - *Iteración Parámetros*: PAR-01 cuatro veces (un dataset distinto cada vez), PAR-02, PAR-03.
   - *Iteración Estados*: DEMO-01, DEMO-02, DEMO-03 y los casos "agrupadores" de `referencias-automatizadas.md`.
5. En el plan de ejecución: seleccionar casos → ejecutar automatizados.

## 5. Qué debe pasar (checklist de verificación)

| Prueba | Resultado esperado |
|---|---|
| Iteración Smoke y Regresión | Todo en Éxito, con reporte HTML adjunto |
| PAR-01 × 4 datasets | Éxito en los 4; en el reporte, la anotación `dataset` muestra el nombre |
| PAR-02 | Éxito; el JUnit/HTML muestra `TC_REFERENCE`, `TC_UUID` y `DSNAME` reales (no "ejecución local") |
| DEMO-01 / 02 / 03 | Éxito / Fallo / Bloqueado |
| Referencia agrupadora Éxito+Fallo | Fallo |
| Referencia agrupadora Éxito+Fallo+Error | Bloqueado |
| Con `PLAYWRIGHT_EXTRA_OPTIONS` con espacios en Linux | No soportado (usar `--opcion=valor`) |

## 6. Problemas típicos

- **"No tests found"** → la carpeta de la referencia no coincide con `testDir` (`./tests`) o el repo se llama distinto.
- **Caso en Bloqueado inesperado** → revisar `pw_junit_report.xml`: un `<error>` es un fallo técnico (timeout, excepción), no una aserción.
- **Bloqueado vs Fallo según versión de Playwright**: esta distinción depende de cómo el reporter JUnit clasifica el error. En Playwright 1.65 los fallos de `expect(...)` van como `<failure>` y el resto como `<error>`. Con versiones antiguas (p. ej. 1.41) puede que todo salga como `<failure>`; si DEMO-03 no da Bloqueado, compruébalo con `npm ls @playwright/test`.
- **El runner no levanta la app** → `playwright.config.ts` ejecuta `node server.js` solo si no hay `TC_CUF_BASE_URL`/`BASE_URL`. El runner necesita el puerto 3000 libre.
- **Chrome instalado a mano** → define `PW_CHROME_PATH` en el runner.

## Fuentes

- Playwright en Squash AUTOM: https://autom-devops-en.doc.squashtest.com/2024-07/autom/techno/playwright.html
- Instalación de Squash AUTOM: https://autom-devops-en.doc.squashtest.com/2023-05/autom/install.html
- Importación de casos de prueba: https://tm-en.doc.squashtest.com/v15/user-guide/manage-test-cases/import-test-cases.html
