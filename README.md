# Kevin Paul Montealegre Melo Portfolio - Angular SSR

Portfolio profesional desarrollado con Angular 21, renderizado híbrido con SSR, estructura modular basada en features y despliegue automatizado hacia un VPS. Este proyecto centraliza presentación profesional, branding técnico y consumo de APIs para contenido dinámico, priorizando mantenibilidad, performance y una operación simple en producción.

## Descripción general

La aplicación fue construida como una SPA moderna reforzada con Server-Side Rendering usando `@angular/ssr`, `Express` y salida en modo `server`, lo que mejora SEO, tiempo de primera pintura y control del despliegue en infraestructura propia. El proyecto usa Angular 21, TypeScript 5.9, Angular Material, RxJS y una configuración de build separada para desarrollo y producción.

El repositorio contiene una sola aplicación Angular llamada `portfolio`, con `sourceRoot` en `src`, assets públicos en `public` y estilos globales en `src/styles.scss`. La build de producción aplica reemplazo de entornos, hashing de artefactos, optimización de scripts y estilos, y presupuestos de tamaño para vigilar el bundle inicial y los estilos por componente.

## Stack técnico

| Capa | Tecnologías | Propósito |
|---|---|---|
| Frontend | Angular 21, TypeScript, RxJS | Renderizado de UI, tipado fuerte y flujos reactivos. |
| UI/UX | Angular Material, SCSS/CSS | Componentización visual, consistencia de interfaz y personalización de estilos. |
| SSR | `@angular/ssr`, `@angular/platform-server`, Express | Renderizado del lado del servidor y entrega híbrida de contenido. |
| Routing | Angular Router, resolver y guard | Navegación declarativa, carga anticipada y protección de rutas. |
| Integración API | `HttpClient`, interceptor, environments | Consumo desacoplado de backend y configuración por entorno. |
| DevOps | GitHub Actions, VPS, Nginx | Build, despliegue automatizado y exposición segura del servicio. |

## Sistema de diseño

El proyecto no solo implementa Angular Material, sino que adapta lineamientos de Material 3 sobre una identidad visual propia mediante tokens CSS, tematización de Angular Material y soporte explícito para modo claro y modo oscuro. Esto permite una base de diseño consistente, escalable y alineada con una experiencia moderna de producto digital.

### Lineamientos de Material 3

La hoja global `src/styles.scss` activa el motor de Angular Material, incorpora clases de elevación y fondo de aplicación, y define un tema Material 3 con `mat.theme(...)`, tipografía personalizada y densidad neutra. También expone variables del sistema como `--mat-sys-primary`, `--mat-sys-surface`, `--mat-sys-background` y `--mat-sys-outline-variant`, lo que demuestra una personalización deliberada del sistema visual de Material 3 en lugar de usar el tema por defecto.

Además, se definieron curvas de animación y duraciones como `--m3-easing-standard`, `--m3-easing-emphasized` y `--m3-duration-long`, lo que indica una adopción parcial de principios de motion de Material 3 para transiciones más fluidas y consistentes. Este detalle eleva la calidad percibida del portfolio y refuerza una presentación más premium y profesional.

### Paleta de colores

La paleta principal responde a una estética "clean tech" declarada en los tokens globales del proyecto. En modo claro, se usan tonos oscuros neutrales para texto y contraste (`#111827`, `#374151`, `#6B7280`), fondos limpios (`#FFFFFF`, `#F3F4F6`) y un acento azul tecnológico (`#0062FF`) con una variante más intensa para gradientes y estados destacados (`#004BD6`).

| Rol visual | Token | Valor |
|---|---|---|
| Texto principal | `--text-primary` | `#111827` en light, `#F9FAFB` en dark. |
| Texto secundario | `--text-secondary` | `#374151` en light, `#D1D5DB` en dark. |
| Fondo base | `--bg` | `#FFFFFF` en light, `#0B0F19` en dark. |
| Superficie | `--surface` | `#FFFFFF` en light, `#111827` en dark. |
| Acento principal | `--accent-main` | `#0062FF`. |
| Acento secundario/glow | `--accent-glow` | `#004BD6`. |
| Divisor | `--divider` | `#E5E7EB` en light y `rgba(255, 255, 255, 0.15)` en dark. |

La presencia de gradientes como `--grad-primary` y `--grad-blob`, además de sombras tokenizadas (`--shadow-md`, `--shadow-lg`, `--shadow-hover`), sugiere una capa visual enfocada en profundidad sutil, contraste elegante y componentes destacados sin romper sobriedad. En otras palabras, el lenguaje visual busca verse tecnológico, limpio y ejecutivo al mismo tiempo.

### Tipografía

La tipografía principal del proyecto es `Poppins`, cargada localmente mediante múltiples declaraciones `@font-face` para pesos 300, 400, 500, 600, 700 y 800, además de variante itálica. Esto permite controlar jerarquía visual con precisión y evita depender exclusivamente de fuentes remotas.

El token `--font-main` establece `Poppins` como familia principal, con fallback a `Helvetica Neue` y `sans-serif`, y el tema de Angular Material también se configura sobre `Poppins, sans-serif`. Esa consistencia entre sistema global y componentes Material asegura una experiencia tipográfica uniforme en toda la aplicación.

### Modo claro y oscuro

El proyecto implementa una estrategia de dual theme mediante `html` y `html.dark-theme`, redefiniendo tokens clave para color, superficies, divisores y contraste. Esto no es solo un cambio cosmético: conserva semántica visual entre modos y mantiene legibilidad, densidad y jerarquía de interfaz bajo un modelo coherente.

Desde una perspectiva profesional, esta decisión mejora accesibilidad, adapta el portfolio a preferencias de usuario y refuerza la madurez del frontend. También encaja con el uso de `ThemeService`, que ya administra estado visual mediante `signal()`, cerrando bien la integración entre diseño y lógica de presentación.


## Novedades recientes

El portfolio se mantiene en evolución activa con ajustes orientados a reforzar presentación profesional, experiencia de usuario y claridad técnica del repositorio. Los cambios más recientes reflejan una estrategia de iteración continua sobre contenido, diseño visual y mantenimiento de piezas clave del perfil profesional.

### Evolución del módulo de proyectos

La sección de proyectos recibió una nueva capa de estilos centrada en un layout más robusto y responsive. Este ajuste mejora la jerarquía visual del componente, optimiza la distribución de contenido en distintos breakpoints y fortalece la lectura de proyectos como piezas principales del portfolio.

Además, la lógica de parallax fue retirada de `ProjectsComponent` para simplificar el comportamiento visual y reducir complejidad innecesaria en la capa interactiva. Esta decisión favorece una experiencia más estable, mantenible y consistente con un portfolio profesional que prioriza claridad, rendimiento y legibilidad.

### CV e internacionalización

El repositorio también incorpora mantenimiento activo del módulo de CV, con actualizaciones recientes en los archivos PDF de presentación profesional. Entre estos cambios se encuentran la sustitución del CV en inglés, la actualización de la versión en español y la incorporación de una edición 2026 del CV en español, alineando mejor el portfolio con la evolución actual del perfil técnico.

De forma complementaria, se ajustaron textos en `public/i18n/es.json` y `public/i18n/en.json`, incluyendo refinamientos en la descripción relacionada con Android TV. Esto confirma que la aplicación mantiene una estrategia bilingüe real y que el contenido visible al usuario evoluciona junto con la propuesta profesional del sitio.

### Estado actual del proyecto

Este repositorio no funciona como una landing estática, sino como una base viva para experimentar con arquitectura Angular moderna, SSR, branding técnico, presentación profesional y evolución iterativa de la interfaz. La combinación de mejoras visuales, simplificación de interacciones y actualización continua del contenido hace que el portfolio sea tanto una vitrina profesional como un producto mantenido activamente.

## Scripts disponibles

Además del stack y la arquitectura, el proyecto expone scripts útiles para desarrollo, verificación y ejecución de la salida SSR.

| Script | Propósito |
|---|---|
| `npm start` | Levanta la aplicación en entorno de desarrollo con Angular CLI. |
| `npm run build` | Genera la build de la aplicación. |
| `npm run watch` | Compila en modo desarrollo observando cambios. |
| `npm run test` | Ejecuta las pruebas del proyecto. |
| `npm run serve:ssr:portfolio` | Ejecuta la salida SSR generada en `dist/portfolio/server/server.mjs`. |
| `npm run check` | Ejecuta una verificación rápida de build mediante `ng build`. |

## Arquitectura del proyecto

La estructura sigue una separación clara por responsabilidades: `core` concentra servicios, guardas, interceptores y resolvers reutilizables; `features` encapsula secciones funcionales como hero, about y projects; y `layout` orquesta composición visual con home, navbar, public-layout y componentes auxiliares como WhatsApp. Esta distribución favorece escalabilidad, bajo acoplamiento y lectura rápida del dominio visual de la aplicación.

A nivel de bootstrap, el proyecto usa configuración por archivos (`app.config.ts`, `app.config.server.ts`, `app.routes.ts` y `app.routes.server.ts`) en lugar de un enfoque monolítico, lo que sugiere una arquitectura Angular moderna basada en configuración declarativa y standalone components. La presencia de `main.ts`, `main.server.ts` y `server.ts` confirma una estrategia híbrida donde el navegador y el servidor tienen puntos de entrada diferenciados.

## Patrones identificados

### 1. Standalone Components

Componentes como `home`, `navbar` y `public-layout` están declarados con `standalone: true`, lo que elimina la dependencia de `NgModule` tradicionales y reduce fricción al escalar la UI. Este patrón simplifica composición, lazy loading y mantenimiento del árbol de dependencias.

### 2. Feature-Based Organization

Las vistas y piezas de negocio se agrupan por capacidad funcional (`features/about`, `features/hero`, `features/projects`) en lugar de hacerlo por tipo de archivo global. Ese patrón mejora cohesión y hace que cada bloque del portfolio pueda evolucionar de forma aislada.

### 3. Core Layer / Shared Cross-Cutting Concerns

`core/services`, `core/guards`, `core/interceptors` y `core/resolvers` muestran un patrón clásico de capa transversal para seguridad, acceso a datos, navegación y lógica compartida. Esto evita duplicación y centraliza decisiones técnicas sensibles como autenticación y enriquecimiento de requests.

### 4. Reactive State con Signals y Computed

`ThemeService` y `AuthService` usan `signal()` y `computed()`, lo que indica adopción de reactividad nativa de Angular para estado liviano en cliente. Este patrón reduce complejidad frente a soluciones más pesadas y encaja bien con un portfolio de experiencia controlada.

### 5. Route Guard + Resolver

El uso de `authGuard` y `blogArticleResolver` evidencia un patrón de enrutamiento robusto: el guard controla acceso y el resolver prepara datos antes de activar la ruta. Esto mejora UX, reduce lógica en componentes y mantiene responsabilidades bien delimitadas.

### 6. Environment-Based Configuration

La aplicación maneja `environment.ts`, `environment.development.ts` y `environment.production.ts` con sustitución en build. Este patrón desacopla configuración operativa del código, especialmente para URLs base de API y comportamiento según entorno.

## Módulo administrativo

El proyecto no es solo un portfolio público: también incorpora una capa administrativa para autenticación y gestión de noticias del blog. Las rutas `admin/login` y `admin` están definidas explícitamente, donde la segunda queda protegida por `authGuard`, reforzando una separación clara entre experiencia pública y operación editorial.

### Admin Login

El flujo de acceso administrativo se implementa mediante `AdminLoginComponent`, un formulario reactivo que solicita contraseña, valida longitud mínima, muestra estados de carga y controla mensajes de error orientados al usuario. Cuando el login es exitoso, la aplicación navega a `/admin`; si falla, responde con mensajes claros para credenciales inválidas o backend no disponible.

A nivel de integración, `AuthService` consume `${environment.apiBaseUrl}/api/auth/token` y espera una respuesta con un `token`, lo que encaja con un backend protegido por Spring Security y autenticación basada en JWT. El token se mantiene en memoria con `signal()` bajo la clave conceptual `blog_jwt`, y `isAuthenticated` se deriva mediante `computed()`, manteniendo una lógica Angular moderna y simple.

### JWT, guard e interceptor

El `authInterceptor` inspecciona cada request saliente y, si existe token, adjunta automáticamente el header `Authorization: Bearer <token>`. Este patrón desacopla la autenticación del resto de componentes y facilita que cualquier endpoint protegido del backend pueda ser consumido sin repetir lógica manual en cada servicio.

Por su parte, `authGuard` valida el estado autenticado antes de permitir el acceso a `/admin`; si no hay sesión activa, redirige a `/admin/login`. Esta combinación de guard + interceptor refleja una integración frontend ordenada con una API protegida por Spring Security y JWT.

### Admin News

La gestión editorial se concentra en `AdminNewsComponent`, un componente standalone con estado reactivo, formulario para edición y manejo de imágenes, pensado para administrar publicaciones del blog desde la propia interfaz Angular. El componente mantiene señales para listado de artículos, carga, errores, editor abierto, artículo seleccionado, imagen actual, preview local y estado de envío.

Desde el punto de vista funcional, `NewsService` expone un conjunto completo de operaciones para el módulo administrativo: lectura paginada de noticias para administración, consulta pública, detalle por slug, creación, actualización y normalización de URLs de imagen. También se observa construcción de `FormData` para adjuntar archivos junto con el payload JSON del artículo, lo que confirma soporte para creación o edición de noticias con imagen.

### Operación editorial del blog

Las interfaces `NewsArticle`, `NewsListResponse`, `CreateNewsRequest` y `UpdateNewsRequest` muestran que el blog fue diseñado como un pequeño CMS desacoplado, no como contenido hardcodeado en el frontend. En consecuencia, el portfolio incorpora una capacidad profesional adicional: publicar, editar y administrar noticias respaldadas por un backend seguro, lo que eleva el proyecto desde una vitrina personal hacia una plataforma de contenido operable.

## Servicios y consumo de endpoints

El consumo HTTP se concentra en servicios de la capa `core`, principalmente `AuthService` y `NewsService`, ambos construidos sobre `HttpClient`. Además, existe un interceptor de autenticación y una guarda asociada, lo que materializa una cadena consistente para autenticación, autorización y consumo de endpoints protegidos para el panel administrativo del blog.

Los entornos de desarrollo y producción apuntan a `https://api.paul9834.com`, mientras que el entorno base local usa `http://localhost:8080`, indicando separación entre backend local y backend desplegado. Esta decisión facilita pruebas locales y despliegues repetibles sin modificar el código fuente del servicio.

A nivel funcional, el frontend consume al menos dos dominios de API relevantes: autenticación administrativa vía `/api/auth/token` y gestión de noticias vía `/api/news`. Dentro de este último aparecen rutas para consumo público y administrativo, incluyendo la variante `/api/news/admin`, además de obtención de artículos por `slug`, creación, actualización y normalización de imágenes devueltas por backend.

El resolver `blogArticleResolver` confirma además una ruta de detalle que obtiene artículos antes del render, útil para SEO, navegación directa y SSR. En conjunto, esto revela una integración bien planteada entre Angular, Spring Security, JWT y una API editorial orientada a contenido dinámico.

## SSR y estrategia de renderizado

El archivo `angular.json` define `outputMode: server`, una entrada de servidor SSR y `src/server.ts` como punto de integración, mientras que `package.json` expone el script `serve:ssr:portfolio` que ejecuta `node dist/portfolio/server/server.mjs`. Esto confirma un despliegue orientado a Node.js en servidor, no únicamente a archivos estáticos.

Desde el punto de vista operativo, esta elección permite renderizar HTML en el servidor, mejorar indexación, controlar metadatos dinámicos y luego delegar la hidratación al cliente. También encaja bien con Nginx como reverse proxy frontal, dejando a Node/Express la responsabilidad del render y a Nginx la terminación TLS, compresión y entrega pública.

## Proceso de despliegue en VPS

El repositorio incluye un workflow de GitHub Actions en `.github/workflows/deploy.yml`, lo que indica automatización del pipeline de despliegue. Junto con la presencia de build SSR y ejecución por `server.mjs`, el proceso esperado para producción consiste en compilar la app en CI, transferir artefactos o actualizar el proyecto en el VPS, instalar dependencias y reiniciar el proceso Node que sirve el SSR.

En una arquitectura de VPS profesional, Nginx debe quedar al frente escuchando en 80/443, redirigiendo tráfico al proceso Node local que expone la app SSR, normalmente en un puerto interno como 4000 o similar. El flujo recomendado queda así: GitHub Actions despliega al VPS, Node ejecuta `dist/portfolio/server/server.mjs`, y Nginx publica el dominio y actúa como reverse proxy estable y seguro.

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

Ese enfoque desacopla publicación web, certificados y control de tráfico del runtime Angular/Node, y es la forma más seria de operar una aplicación SSR en un VPS. La configuración exacta del puerto y del proceso supervisor puede variar, pero el patrón arquitectónico sigue siendo el mismo.

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

La organización evidencia una intención profesional de separar UI, layout, infraestructura Angular, configuración de entorno y activos estáticos. También deja una base clara para seguir agregando secciones como blog, panel administrativo o integraciones externas sin rehacer la arquitectura.

## Scripts disponibles

| Script | Función |
|---|---|
| `npm start` | Levanta servidor de desarrollo con `ng serve`. |
| `npm run build` | Genera build de aplicación según configuración por defecto, actualmente producción. |
| `npm run watch` | Ejecuta build en modo observación para desarrollo. |
| `npm test` | Ejecuta pruebas unitarias configuradas en Angular Build. |
| `npm run serve:ssr:portfolio` | Inicia el servidor Node SSR usando `server.mjs` compilado. |

## Variables y entornos

La URL base del backend se controla por entorno, con backend local en `localhost:8080` y backend remoto en `api.paul9834.com`. Esta práctica facilita integración continua, pruebas por ambiente y despliegues consistentes entre local, staging y producción.

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.paul9834.com',
};
```

## Calidad técnica

La solución refleja decisiones maduras para un portfolio profesional: SSR para visibilidad y performance, separación por capas, servicios tipados, control de acceso, resolver de datos, configuración por entorno y pipeline de despliegue automatizable. También muestra coherencia entre frontend, backend API y operación sobre VPS, lo que eleva el proyecto por encima de un portfolio estático tradicional.

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

- Incorporar documentación explícita del workflow de GitHub Actions y del proceso real de publicación en VPS.
- Añadir diagrama de arquitectura con flujo Browser -> Nginx -> Node SSR -> API.
- Documentar endpoints reales consumidos por `AuthService` y `NewsService` para auditoría técnica más precisa.
- Agregar estrategia de observabilidad básica, logs estructurados y health checks para operación productiva.
- Complementar con pruebas unitarias y de integración enfocadas en servicios, guards y resolvers.
