# Referencias automatizadas (campo *Automated test reference*)

Repositorio Git en Squash TM: **`squash-playwright-demo`** (el nombre debe coincidir con el configurado en Administración).

## Un caso de Squash = un test de Playwright

| Caso | Nombre | Automated test reference | Esperado |
|---|---|---|---|
| AUTH-01 | Login exitoso con credenciales válidas | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-01` | Éxito |
| AUTH-02 | Error de autenticación con clave incorrecta | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-02` | Éxito |
| AUTH-03 | Usuario bloqueado no puede iniciar sesión | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-03` | Éxito |
| AUTH-04 | Validación de campos obligatorios vacíos | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-04` | Éxito |
| AUTH-05 | Cierre de sesión redirige al login | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-05` | Éxito |
| AUTH-06 | Acceso directo al panel sin sesión redirige al login | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-06` | Éxito |
| TODO-01 | Agregar una tarea nueva | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-01` | Éxito |
| TODO-02 | No permite agregar una tarea vacía | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-02` | Éxito |
| TODO-03 | No permite tareas duplicadas | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-03` | Éxito |
| TODO-04 | Completar una tarea actualiza el contador | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-04` | Éxito |
| TODO-05 | Eliminar una tarea | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-05` | Éxito |
| TODO-06 | Filtrar por tareas completadas | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-06` | Éxito |
| TODO-07 | Las tareas persisten tras recargar la página | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-07` | Éxito |
| TODO-08 | Rechaza tareas de más de 60 caracteres | `squash-playwright-demo/tests/todos#todos.spec.ts#TODO-08` | Éxito |
| REG-01 | Registro exitoso con datos válidos | `squash-playwright-demo/tests/registro#registro.spec.ts#REG-01` | Éxito |
| REG-02 | Rechaza correo con formato inválido | `squash-playwright-demo/tests/registro#registro.spec.ts#REG-02` | Éxito |
| REG-03 | Rechaza a menores de edad | `squash-playwright-demo/tests/registro#registro.spec.ts#REG-03` | Éxito |
| REG-04 | Exige aceptar los términos y condiciones | `squash-playwright-demo/tests/registro#registro.spec.ts#REG-04` | Éxito |
| REG-05 | Muestra todos los errores con el formulario vacío | `squash-playwright-demo/tests/registro#registro.spec.ts#REG-05` | Éxito |
| API-01 | El estado del servicio responde ok | `squash-playwright-demo/tests/api#api.spec.ts#API-01` | Éxito |
| API-02 | El listado de productos devuelve 5 elementos | `squash-playwright-demo/tests/api#api.spec.ts#API-02` | Éxito |
| API-03 | Un producto inexistente responde 404 | `squash-playwright-demo/tests/api#api.spec.ts#API-03` | Éxito |
| API-04 | Login por API con credenciales válidas devuelve token | `squash-playwright-demo/tests/api#api.spec.ts#API-04` | Éxito |
| API-05 | Login por API de usuario bloqueado responde 423 | `squash-playwright-demo/tests/api#api.spec.ts#API-05` | Éxito |
| PAR-01 | Login dirigido por dataset (DS_USUARIO, DS_PASSWORD, DS_RESULTADO) | `squash-playwright-demo/tests/params#parametros.spec.ts#PAR-01` | Éxito con DS-exito / DS-clave-incorrecta / DS-bloqueado / DS-qa-exito |
| PAR-02 | Metadatos de ejecución recibidos de Squash (TC_REFERENCE, TC_UUID, DSNAME) | `squash-playwright-demo/tests/params#parametros.spec.ts#PAR-02` | Éxito |
| PAR-03 | URL y timeout configurables por campos personalizados (TC_CUF_BASE_URL, TC_CUF_TIMEOUT_MS) | `squash-playwright-demo/tests/params#parametros.spec.ts#PAR-03` | Éxito |
| DEMO-01 | Prueba que pasa siempre | `squash-playwright-demo/tests/demo-estados#estados.spec.ts#DEMO-01` | Éxito |
| DEMO-02 | Fallo funcional intencional | `squash-playwright-demo/tests/demo-estados#estados.spec.ts#DEMO-02` | Fallo |
| DEMO-03 | Error técnico intencional | `squash-playwright-demo/tests/demo-estados#estados.spec.ts#DEMO-03` | Bloqueado |

> El último segmento (`#AUTH-01`) es un regex para `--grep`: cada test tiene un ID único en el título, así que cada referencia ejecuta exactamente un test.

## Referencias que agrupan varios tests (para probar la regla de estados)

| Objetivo | Automated test reference | Esperado |
|---|---|---|
| Todo el archivo de login (6 tests) | `squash-playwright-demo/tests/auth#login.spec.ts` | Éxito |
| Todos los archivos de una carpeta (regex de archivo) | `squash-playwright-demo/tests/todos#.*\.spec\.ts` | Éxito |
| Solo los tests `@smoke` de todo el proyecto (4 tests) | `squash-playwright-demo/tests#.*\.spec\.ts#@smoke` | Éxito |
| Varios tests por regex de nombre | `squash-playwright-demo/tests/auth#login.spec.ts#AUTH-0[1-3]` | Éxito |
| Éxito + Fallo | `squash-playwright-demo/tests/demo-estados#estados.spec.ts#DEMO-0[12]` | **Fallo** |
| Éxito + Fallo + Error técnico | `squash-playwright-demo/tests/demo-estados#estados.spec.ts` | **Bloqueado** |

Regla de Squash: cualquier test con *error técnico* → Bloqueado; si no, cualquier fallo → Fallo; si no, Éxito.

## Datasets de PAR-01

Crear en el caso PAR-01 los parámetros `USUARIO`, `PASSWORD`, `RESULTADO` y estos datasets (ya incluidos en el Excel de importación). Añadir el caso **una vez por dataset** al plan de ejecución de la iteración.

| Dataset | USUARIO | PASSWORD | RESULTADO | Esperado |
|---|---|---|---|---|
| DS-exito | admin | Admin123! | EXITO | Éxito |
| DS-qa-exito | qa | Qa12345! | EXITO | Éxito |
| DS-clave-incorrecta | admin | mal | ERROR | Éxito (el test espera el mensaje de error) |
| DS-bloqueado | bloqueado | Bloq123! | BLOQUEADO | Éxito (el test espera el mensaje de bloqueo) |

Para forzar un **Fallo** a propósito: dataset con `admin` / `mal` / `EXITO`.

## Campos personalizados (opcionales) del caso de prueba

| Código del CUF | Variable que recibe Playwright | Uso |
|---|---|---|
| `BASE_URL` | `TC_CUF_BASE_URL` | Apunta los tests a otro entorno (si se define, no se levanta la app local) |
| `TIMEOUT_MS` | `TC_CUF_TIMEOUT_MS` | Timeout de navegación de PAR-03 |

Variables siempre disponibles (Community): `DSNAME`, `DS_<parámetro>`, `TC_REFERENCE`, `TC_UUID`, `TC_CUF_<código>`.
