# Diagrama de Arquitectura - KP Portfolio

```mermaid
flowchart TB
    subgraph Client["Navegador (Angular Client)"]
        UI["Componentes Standalone<br/>(Hero, About, Projects, Navbar,
         Home, PublicLayout, WhatsApp)"]
        Router["Angular Router<br/>(routes.ts)"]
        Guards["Guards (authGuard)"]
        Resolvers["Resolvers (blogArticleResolver)"]
        Services["Servicios (AuthService,
         NewsService, ThemeService)"]
    end

    subgraph Core["Core Layer (src/app/core)"]
        Interceptors["Interceptor (auth.interceptor)"]
        CoreServices["Servicios Transversales"]
    end

    subgraph Server["Servidor SSR (Node.js + Express)"]
        SSR["@angular/ssr<br/>(server.ts)"]
        Express["Express Server<br/>(server.mjs)"]
        API["API Backend<br/>(api.paul9834.com)"]
    end

    subgraph Infra["Infraestructura"]
        Nginx["Nginx Reverse Proxy<br/>(80/443)"]
        VPS["VPS (DigitalOcean)"]
        GitHub["GitHub Actions<br/>(CI/CD)"]
    end

    Usuario((Usuario)) --> Nginx
    Nginx --> SSR
    SSR --> Express
    Express --> API
    SSR -->|Hydration| Client
    
    UI --> Router
    Router --> Guards
    Router --> Resolvers
    Router --> Services
    Services --> Interceptors
    Interceptors --> CoreServices
    
    GitHub -->|Deploy| VPS
    VPS --> Nginx
    VPS --> SSR
