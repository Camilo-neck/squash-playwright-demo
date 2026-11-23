# squash-playwright-demo

Proyecto de práctica para validar la integración **Squash TM → Squash AUTOM (OpenTestFactory) → Playwright**.

- **App bajo prueba** (`app/`, `server.js`): portal con login, lista de tareas, formulario de registro y una API REST. Sin dependencias, la levanta Playwright solo.
- **Tests** (`tests/`): 30 tests de Playwright con ID único en el título (`AUTH-01`, `TODO-03`, …) para mapear 1 caso de Squash = 1 test.
- **Squash** (`squash/`): Excel de importación (30 casos, pasos, parámetros y 4 datasets), tabla de referencias automatizadas y guía de configuración.
- **Simulador** (`scripts/simular-squash.mjs`): reproduce localmente lo que hace el orquestador y calcula el estado de Squash.

```bash
npm install
npx playwright install chromium
npm run test:estables     # 27 tests: deben pasar
npm run test:smoke        # 4 tests @smoke
npm run test:demo         # 3 tests que pasan / fallan / dan error a propósito
node scripts/simular-squash.mjs "squash-playwright-demo/tests/auth#login.spec.ts#AUTH-01"
```

| Carpeta | Tests | Qué cubre |
|---|---|---|
| `tests/auth` | AUTH-01…06 | login ok/error/bloqueado, validaciones, logout, ruta protegida |
| `tests/todos` | TODO-01…08 | alta, validaciones, completar, borrar, filtro, persistencia |
| `tests/registro` | REG-01…05 | formulario con validaciones |
| `tests/api` | API-01…05 | API REST (status, listado, 404, login 200/423) |
| `tests/params` | PAR-01…03 | variables de Squash: `DS_*`, `DSNAME`, `TC_REFERENCE`, `TC_UUID`, `TC_CUF_*` |
| `tests/demo-estados` | DEMO-01…03 | Éxito / Fallo / Bloqueado (marcados `@demo`) |

Empieza por `squash/GUIA-CONFIGURACION-SQUASH.md`.
