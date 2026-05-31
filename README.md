# KP Portfolio - Angular SSR

Portfolio profesional desarrollado con Angular 21, renderizado híbrido con SSR, estructura modular basada en features y despliegue automatizado hacia un VPS. Este proyecto centraliza presentación profesional, branding técnico y consumo de APIs para contenido dinámico, priorizando mantenibilidad, performance y una operación simple en producción. [cite:3][cite:4]

## Descripción general

La aplicación fue construida como una SPA moderna reforzada con Server-Side Rendering usando `@angular/ssr`, `Express` y salida en modo `server`, lo que mejora SEO, tiempo de primera pintura y control del despliegue en infraestructura propia. El proyecto usa Angular 21, TypeScript 5.9, Angular Material, RxJS y una configuración de build separada para desarrollo y producción. [cite:3]

El repositorio contiene una sola aplicación Angular llamada `portfolio`, con `sourceRoot` en `src`, assets públicos en `public` y estilos globales en `src/styles.scss`. La build de producción aplica reemplazo de entornos, hashing de artefactos, optimización de scripts y estilos, y presupuestos de tamaño para vigilar el bundle inicial y los estilos por componente. [cite:3]

## Stack técnico

| Capa | Tecnologías | Propósito |
|---|---|---|
| Frontend | Angular 21, TypeScript, RxJS | Renderizado de UI, tipado fuerte y flujos reactivos. [cite:3] |
| UI/UX | Angular Material, SCSS/CSS | Componentización visual, consistencia de interfaz y personalización de estilos. [cite:3][cite:4] |
| SSR | `@angular/ssr`, `@angular/platform-server`, Express | Renderizado del lado del servidor y entrega híbrida de contenido. [cite:3] |
| Routing | Angular Router, resolver y guard | Navegación declarativa, carga anticipada y protección de rutas. [cite:4] |
| Integración API | `HttpClient`, interceptor, environments | Consumo desacoplado de backend y configuración por entorno. [cite:4] |
| DevOps | GitHub Actions, VPS, Nginx | Build, despliegue automatizado y exposición segura del servicio. [cite:2][cite:4] |

## Sistema de diseño

El proyecto no solo implementa Angular Material, sino que adapta lineamientos de Material 3 sobre una identidad visual propia mediante tokens CSS, tematización de Angular Material y soporte explícito para modo claro y modo oscuro. Esto permite una base de diseño consistente, escalable y alineada con una experiencia moderna de producto digital. [cite:6]

### Lineamientos de Material 3

La hoja global `src/styles.scss` activa el motor de Angular Material, incorpora clases de elevación y fondo de aplicación, y define un tema Material 3 con `mat.theme(...)`, tipografía personalizada y densidad neutra. También expone variables del sistema como `--mat-sys-primary`, `--mat-sys-surface`, `--mat-sys-background` y `--mat-sys-outline-variant`, lo que demuestra una personalización deliberada del sistema visual de Material 3 en lugar de usar el tema por defecto. [cite:6]

Además, se definieron curvas de animación y duraciones como `--m3-easing-standard`, `--m3-easing-emphasized` y `--m3-duration-long`, lo que indica una adopción parcial de principios de motion de Material 3 para transiciones más fluidas y consistentes. Este detalle eleva la calidad percibida del portfolio y refuerza una presentación más premium y profesional. [cite:6]

### Paleta de colores

La paleta principal responde a una estética "clean tech" declarada en los tokens globales del proyecto. En modo claro, se usan tonos oscuros neutrales para texto y contraste (`#111827`, `#374151`, `#6B7280`), fondos limpios (`#FFFFFF`, `#F3F4F6`) y un acento azul tecnológico (`#0062FF`) con una variante más intensa para gradientes y estados destacados (`#004BD6`). [cite:6]

| Rol visual | Token | Valor |
|---|---|---|
| Texto principal | `--text-primary` | `#111827` en light, `#F9FAFB` en dark. [cite:6] |
| Texto secundario | `--text-secondary` | `#374151` en light, `#D1D5DB` en dark. [cite:6] |
| Fondo base | `--bg` | `#FFFFFF` en light, `#0B0F19` en dark. [cite:6] |
| Superficie | `--surface` | `#FFFFFF` en light, `#111827` en dark. [cite:6] |
| Acento principal | `--accent-main` | `#0062FF`. [cite:6] |
| Acento secundario/glow | `--accent-glow` | `#004BD6`. [cite:6] |
| Divisor | `--divider` | `#E5E7EB` en light y `rgba(255, 255, 255, 0.15)` en dark. [cite:6] |

La presencia de gradientes como `--grad-primary` y `--grad-blob`, además de sombras tokenizadas (`--shadow-md`, `--shadow-lg`, `--shadow-hover`), sugiere una capa visual enfocada en profundidad sutil, contraste elegante y componentes destacados sin romper sobriedad. En otras palabras, el lenguaje visual busca verse tecnológico, limpio y ejecutivo al mismo tiempo. [cite:6]

### Tipografía

La tipografía principal del proyecto es `Poppins`, cargada localmente mediante múltiples declaraciones `@font-face` para pesos 300, 400, 500, 600, 700 y 800, además de variante itálica. Esto permite controlar jerarquía visual con precisión y evita depender exclusivamente de fuentes remotas. [cite:6]

El token `--font-main` establece `Poppins` como familia principal, con fallback a `Helvetica Neue` y `sans-serif`, y el tema de Angular Material también se configura sobre `Poppins, sans-serif`. Esa consistencia entre sistema global y componentes Material asegura una experiencia tipográfica uniforme en toda la aplicación. [cite:6]

### Modo claro y oscuro

El proyecto implementa una estrategia de dual theme mediante `html` y `html.dark-theme`, redefiniendo tokens clave para color, superficies, divisores y contraste. Esto no es solo un cambio cosmético: conserva semántica visual entre modos y mantiene legibilidad, densidad y jerarquía de interfaz bajo un modelo coherente. [cite:6]

Desde una perspectiva profesional, esta decisión mejora accesibilidad, adapta el portfolio a preferencias de usuario y refuerza la madurez del frontend. También encaja con el uso de `ThemeService`, que ya administra estado visual mediante `signal()`, cerrando bien la integración entre diseño y lógica de presentación. [cite:4][cite:6]

## Arquitectura del proyecto

La estructura sigue una separación clara por responsabilidades: `core` concentra servicios, guardas, interceptores y resolvers reutilizables; `features` encapsula secciones funcionales como hero, about y projects; y `layout` orquesta composición visual con home, navbar, public-layout y componentes auxiliares como WhatsApp. Esta distribución favorece escalabilidad, bajo acoplamiento y lectura rápida del dominio visual de la aplicación. [cite:4]

A nivel de bootstrap, el proyecto usa configuración por archivos (`app.config.ts`, `app.config.server.ts`, `app.routes.ts` y `app.routes.server.ts`) en lugar de un enfoque monolítico, lo que sugiere una arquitectura Angular moderna basada en configuración declarativa y standalone components. La presencia de `main.ts`, `main.server.ts` y `server.ts` confirma una estrategia híbrida donde el navegador y el servidor tienen puntos de entrada diferenciados. [cite:4][cite:3]

## Patrones identificados

### 1. Standalone Components

Componentes como `home`, `navbar` y `public-layout` están declarados con `standalone: true`, lo que elimina la dependencia de `NgModule` tradicionales y reduce fricción al escalar la UI. Este patrón simplifica composición, lazy loading y mantenimiento del árbol de dependencias. [cite:4]

### 2. Feature-Based Organization

Las vistas y piezas de negocio se agrupan por capacidad funcional (`features/about`, `features/hero`, `features/projects`) en lugar de hacerlo por tipo de archivo global. Ese patrón mejora cohesión y hace que cada bloque del portfolio pueda evolucionar de forma aislada. [cite:4]

### 3. Core Layer / Shared Cross-Cutting Concerns

`core/services`, `core/guards`, `core/interceptors` y `core/resolvers` muestran un patrón clásico de capa transversal para seguridad, acceso a datos, navegación y lógica compartida. Esto evita duplicación y centraliza decisiones técnicas sensibles como autenticación y enriquecimiento de requests. [cite:4]

### 4. Reactive State con Signals y Computed

`ThemeService` y `AuthService` usan `signal()` y `computed()`, lo que indica adopción de reactividad nativa de Angular para estado liviano en cliente. Este patrón reduce complejidad frente a soluciones más pesadas y encaja bien con un portfolio de experiencia controlada. [cite:4]

### 5. Route Guard + Resolver

El uso de `authGuard` y `blogArticleResolver` evidencia un patrón de enrutamiento robusto: el guard controla acceso y el resolver prepara datos antes de activar la ruta. Esto mejora UX, reduce lógica en componentes y mantiene responsabilidades bien delimitadas. [cite:4]

### 6. Environment-Based Configuration

La aplicación maneja `environment.ts`, `environment.development.ts` y `environment.production.ts` con sustitución en build. Este patrón desacopla configuración operativa del código, especialmente para URLs base de API y comportamiento según entorno. [cite:3][cite:4]

## Servicios y consumo de endpoints

El consumo HTTP se concentra en servicios de la capa `core`, principalmente `AuthService` y `NewsService`, ambos construidos sobre `HttpClient`. Además, existe un interceptor de autenticación y una guarda asociada, lo que sugiere una cadena consistente para adjuntar credenciales, validar sesión y proteger vistas privadas o administrativas. [cite:4]

Los entornos de desarrollo y producción apuntan a `https://api.paul9834.com`, mientras que el entorno base local usa `http://localhost:8080`, indicando separación entre backend local y backend desplegado. Esta decisión facilita pruebas locales y despliegues repetibles sin modificar el código fuente del servicio. [cite:4]

A partir de las interfaces declaradas en `NewsService` (`NewsArticle`, `NewsListResponse`, `CreateNewsRequest`, `UpdateNewsRequest`), se observa un consumo de endpoints orientado a contenido o blogging, probablemente bajo operaciones de listado, detalle, creación y actualización. El resolver `blogArticleResolver` confirma además una ruta que obtiene artículos antes del render, útil para SEO y navegación directa en SSR. [cite:4]

## SSR y estrategia de renderizado

El archivo `angular.json` define `outputMode: server`, una entrada de servidor SSR y `src/server.ts` como punto de integración, mientras que `package.json` expone el script `serve:ssr:portfolio` que ejecuta `node dist/portfolio/server/server.mjs`. Esto confirma un despliegue orientado a Node.js en servidor, no únicamente a archivos estáticos. [cite:3]

Desde el punto de vista operativo, esta elección permite renderizar HTML en el servidor, mejorar indexación, controlar metadatos dinámicos y luego delegar la hidratación al cliente. También encaja bien con Nginx como reverse proxy frontal, dejando a Node/Express la responsabilidad del render y a Nginx la terminación TLS, compresión y entrega pública. [cite:3]

## Proceso de despliegue en VPS

El repositorio incluye un workflow de GitHub Actions en `.github/workflows/deploy.yml`, lo que indica automatización del pipeline de despliegue. Junto con la presencia de build SSR y ejecución por `server.mjs`, el proceso esperado para producción consiste en compilar la app en CI, transferir artefactos o actualizar el proyecto en el VPS, instalar dependencias y reiniciar el proceso Node que sirve el SSR. [cite:2][cite:3]

En una arquitectura de VPS profesional, Nginx debe quedar al frente escuchando en 80/443, redirigiendo tráfico al proceso Node local que expone la app SSR, normalmente en un puerto interno como 4000 o similar. El flujo recomendado queda así: GitHub Actions despliega al VPS, Node ejecuta `dist/portfolio/server/server.mjs`, y Nginx publica el dominio y actúa como reverse proxy estable y seguro. [cite:2][cite:3]

### Ejemplo de bloque Nginx

```nginx
server {
    listen 80;
    server_name paul9834.com www.paul9834.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Ese enfoque desacopla publicación web, certificados y control de tráfico del runtime Angular/Node, y es la forma más seria de operar una aplicación SSR en un VPS. La configuración exacta del puerto y del proceso supervisor puede variar, pero el patrón arquitectónico sigue siendo el mismo. [cite:3]

## Estructura principal

```text
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── resolvers/
│   │   └── services/
│   ├── features/
│   │   ├── about/
│   │   ├── hero/
│   │   └── projects/
│   ├── layout/
│   │   ├── home/
│   │   ├── navbar/
│   │   ├── public-layout/
│   │   └── whatsapp/
│   ├── app.config.ts
│   ├── app.config.server.ts
│   ├── app.routes.ts
│   └── app.routes.server.ts
├── environments/
├── assets/
├── main.ts
├── main.server.ts
└── server.ts
```

La organización evidencia una intención profesional de separar UI, layout, infraestructura Angular, configuración de entorno y activos estáticos. También deja una base clara para seguir agregando secciones como blog, panel administrativo o integraciones externas sin rehacer la arquitectura. [cite:4]

## Scripts disponibles

| Script | Función |
|---|---|
| `npm start` | Levanta servidor de desarrollo con `ng serve`. [cite:3] |
| `npm run build` | Genera build de aplicación según configuración por defecto, actualmente producción. [cite:3] |
| `npm run watch` | Ejecuta build en modo observación para desarrollo. [cite:3] |
| `npm test` | Ejecuta pruebas unitarias configuradas en Angular Build. [cite:3] |
| `npm run serve:ssr:portfolio` | Inicia el servidor Node SSR usando `server.mjs` compilado. [cite:3] |

## Variables y entornos

La URL base del backend se controla por entorno, con backend local en `localhost:8080` y backend remoto en `api.paul9834.com`. Esta práctica facilita integración continua, pruebas por ambiente y despliegues consistentes entre local, staging y producción. [cite:4]

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.paul9834.com',
};
```

## Calidad técnica

La solución refleja decisiones maduras para un portfolio profesional: SSR para visibilidad y performance, separación por capas, servicios tipados, control de acceso, resolver de datos, configuración por entorno y pipeline de despliegue automatizable. También muestra coherencia entre frontend, backend API y operación sobre VPS, lo que eleva el proyecto por encima de un portfolio estático tradicional. [cite:3][cite:4]

## Ejecución local

1. Instalar dependencias:

```bash
npm install
```

2. Ejecutar el entorno de desarrollo:

```bash
npm start
```

3. Generar build de producción:

```bash
npm run build
```

4. Ejecutar la versión SSR compilada:

```bash
npm run serve:ssr:portfolio
```

## Roadmap técnico sugerido

- Incorporar documentación explícita del workflow de GitHub Actions y del proceso real de publicación en VPS. [cite:2]
- Añadir diagrama de arquitectura con flujo Browser -> Nginx -> Node SSR -> API. [cite:3][cite:4]
- Documentar endpoints reales consumidos por `AuthService` y `NewsService` para auditoría técnica más precisa. [cite:4]
- Agregar estrategia de observabilidad básica, logs estructurados y health checks para operación productiva. [cite:3]
- Complementar con pruebas unitarias y de integración enfocadas en servicios, guards y resolvers. [cite:3][cite:4]
