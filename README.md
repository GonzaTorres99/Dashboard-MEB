# Dashboard MEB · Medios Escolares Bonaerenses

Consulta de resultados históricos de las cuatro líneas de formación. React + Vite + TypeScript + Tailwind CSS, Lucide y una Vercel Function con google-auth-library. Sin base de datos, autenticación de visitantes ni escritura en Sheets.

## Ejecutar

Recomendado Node.js 24 LTS (mínimo 22.18) y npm.

```powershell
cd "Dashboard MEB"
npm ci
npm run dev
```

Abrir la dirección indicada por Vite. Vite solo sirve la interfaz: la conexión mostrará un error explícito y ofrecerá **Ver copia de consulta**. Esta copia contiene exclusivamente datos de cohortes publicadas leídos el 3 de noviembre de 2026, con fecha visible. No es una conexión en vivo ni datos inventados. La copia local está en public/data/snapshot.json y está excluida del repositorio: no se distribuye en GitHub. En un clon nuevo, conectar la API para consultar los datos. No contiene observaciones internas, auditorías ni credenciales.

## Conectar Google Sheets y Vercel

1. En Google Cloud, crear o seleccionar un proyecto y habilitar **Google Sheets API**.
2. Crear una cuenta de servicio y una clave JSON. Conservar el JSON fuera del repositorio.
3. Compartir la planilla con el correo client_email de esa cuenta como **Lector**. No hace falta hacer pública la planilla.
4. Copiar .env.example a .env.local. Completar GOOGLE_SERVICE_ACCOUNT_EMAIL con client_email y GOOGLE_PRIVATE_KEY con private_key. Pegar la clave entre comillas; se admiten saltos escapados como `\n`. Nunca usar prefijos VITE_ para credenciales.
5. Para desarrollo integrado, ejecutar `npx vercel dev` desde esta carpeta y completar la vinculación con un proyecto Vercel. Abrir la URL que imprima el CLI, normalmente http://localhost:3000. Verificar http://localhost:3000/api/dashboard: sin credenciales devuelve 503 NOT_CONFIGURED; configurado devuelve JSON con source=live.
6. Para desplegar, importar el repositorio en Vercel, framework **Vite**, raíz del repositorio, build `npm run build`, salida `dist`. Configurar las tres variables de .env.example en los entornos correspondientes y desplegar. Este trabajo no realiza un despliegue en tu cuenta.

La función GET de api/dashboard.ts usa únicamente el scope spreadsheets.readonly y una llamada batchGet de cinco rangos abiertos desde la fila 5. No acepta IDs ni rangos suministrados por visitantes. Retorna solo campos destinados a la web y filtra borradores en el servidor. Las credenciales y google-auth-library no se importan en el frontend.

Caché de 60 segundos por instancia de función y deduplicación de solicitudes concurrentes; el botón Actualizar consulta la API y puede recibir esa caché. Después de un minuto, una nueva consulta lee Sheets sin redesplegar. Los fallos no sustituyen datos silenciosamente: se muestra error y, si existe una consulta anterior, se conserva con su fecha. No hay caché CDN de respuestas ni credenciales.

**Pendiente de configuración:** no se dispone de credenciales de cuenta de servicio en este entorno. La lectura autenticada de producción debe verificarse después de configurarlas. La conexión de Google Drive de este chat no se transfiere al sitio.

## Publicar nuevas cohortes

Añadir la cohorte a COHORTES y sus indicadores a RESULTADOS vinculados por ID. Establecer Estado=Publicada y Mostrar en web=SI. Aparecerá al actualizar después del vencimiento de caché, sin editar el código. No hay límite fijo de cohortes. La fecha y el año provienen de la planilla.

## Reglas de interpretación

- RESULTADOS provee los indicadores generales; MODALIDADES y MODALIDADES_REGION proveen desgloses separados por unidad.
- Vacíos, errores o cantidades inválidas se representan con null; cero se conserva cuando es un dato numérico válido.
- REGIONES con estado diferente de Cargado se muestra pendiente, incluso si contiene ceros de plantilla.
- Un total con alguna cohorte sin datos se presenta como Sin datos para no comunicar una suma parcial como completa.
- Tasa = finalizaron / inscriptos × 100; si falta un dato o el denominador es cero, Sin datos.
- Certificados y finalizaciones son independientes. No se corrigen discrepancias históricas.
- Sumas entre cohortes son participaciones, no personas ni escuelas únicas.
- La API solicita valores numéricos sin formato, evitando depender de separadores regionales. La UI formatea números en es-AR.
- Las fechas de sincronización se muestran en horario argentino y no son fechas de modificación de Sheets.

## Estructura

- src/App.tsx: layout, navegación por hash, filtros y estados de conexión.
- src/pages/Dashboard.tsx: resumen, líneas y detalle de cohortes.
- src/components/Stats.tsx: indicadores reutilizables.
- src/services/data.ts: consulta y errores.
- shared/model.ts: tipos, metadatos, cálculos y formato.
- shared/adapter.ts: adaptación y filtro de publicación.
- api/dashboard.ts: integración de solo lectura.
- tests/data.test.ts: reglas de publicación, vacíos, unidades, totales y API sin configuración.
- public/data/snapshot.json: copia de consulta local, fechada y excluida de Git.
- public/images/logo-meb.png: logo oficial provisto por el área, visible en escritorio y móvil.

Las rutas #/acompanamiento, #/ensenar, #/taller y #/liga evitan rewrites que intercepten /api. El detalle se selecciona dentro de la línea y se reinicia al cambiar año o sección. No se incluye React Router porque la navegación actual no lo necesita.

## Calidad

```powershell
npm run check
```

Ejecuta Oxlint, pruebas con node:test y comprobación TypeScript tanto del cliente como del servidor, además del build. `npm run preview` permite inspeccionar el build estático. El componente Brand muestra el logo oficial sin recortarlo ni deformarlo. La paleta se centraliza en las variables --brand-* de src/index.css: magenta #E12277, turquesa #03ABC1 y azul #3A5175, muestreados de la imagen, con variantes oscuras para textos y controles accesibles.

La configuración y arquitectura siguen las referencias oficiales:
- https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/batchGet
- https://vercel.com/docs/functions/runtimes/node-js

## Próxima iteración

Comparativas entre cohortes y regiones, evolución temporal, exportación de tablas y enlaces directos a cada cohorte. Revisar indicadores parciales con el equipo antes de introducir totales adicionales.


