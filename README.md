# Dashboard MEB

Base de desarrollo de Medios Escolares Bonaerenses. Proyecto React + Vite + TypeScript con Tailwind CSS integrado mediante el plugin de Vite.

## Requisitos y ejecución

Node.js 22.12 o superior (recomendado Node.js 24 LTS) y npm.

Desde la carpeta local del proyecto:

```powershell
cd "Dashboard MEB"
npm ci
npm run dev
```

Abrir la URL que indica Vite, habitualmente http://localhost:5173. Si clonás el repositorio, podés darle ese nombre con:

```powershell
git clone https://github.com/GonzaTorres99/Dashboard-MEB.git "Dashboard MEB"
```

## Comandos

- `npm run dev`: servidor local con recarga.
- `npm run lint`: revisión estática con Oxlint.
- `npm run build`: comprobación TypeScript y compilación en `dist/`.
- `npm run check`: lint y build.
- `npm run preview`: servir localmente el build, después de compilar.

## Estructura

- `src/App.tsx`: pantalla inicial.
- `src/index.css`: importación de Tailwind y estilos globales.
- `src/main.tsx`: entrada de React.
- `vite.config.ts`: plugins de React y Tailwind.

La aplicación está en la raíz del repositorio; la carpeta local se llama **Dashboard MEB**.

## Alcance de esta iteración

Solo configuración y una pantalla de bienvenida responsive en español. Sin datos, dashboard, filtros, gráficos, navegación, backend ni servicios externos. React y React DOM son las únicas dependencias de ejecución; Tailwind y las herramientas de compilación y lint son dependencias de desarrollo. El lockfile permite instalaciones reproducibles.

El logo y los datos mencionados en la conversación anterior no están disponibles en este repositorio. Se incorporarán junto con la identidad visual en una próxima iteración; los tonos actuales son neutros.

No se configuró despliegue. Para publicar bajo un subdirectorio será necesario ajustar `base` en Vite según el hosting.
