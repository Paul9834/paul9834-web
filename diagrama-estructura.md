# Diagrama de Estructura del Proyecto - KP Portfolio

```mermaid
graph TD
    subgraph src["src/"]
        subgraph app["app/"]
            subgraph core["core/"]
                guards["guards/<br/>authGuard"]
                interceptors["interceptors/<br/>auth.interceptor"]
                resolvers["resolvers/<br/>blogArticleResolver"]
                services["services/<br/>AuthService, NewsService,
                  ThemeService"]
            end
            
            subgraph features["features/"]
                about["about/<br/>AboutComponent"]
                hero["hero/<br/>HeroComponent"]
                projects["projects/<br/>ProjectsComponent"]
            end
            
            subgraph layout["layout/"]
                home["home/<br/>HomeComponent"]
                navbar["navbar/<br/>NavbarComponent"]
                publicLayout["public-layout/<br/>PublicLayoutComponent"]
                whatsapp["whatsapp/<br/>WhatsappComponent"]
            end
            
            appConfig["app.config.ts"]
            appConfigServer["app.config.server.ts"]
            routes["app.routes.ts"]
            routesServer["app.routes.server.ts"]
        end
        
        env["environments/<br/>environment.ts,
          environment.production.ts,
          environment.development.ts"]
        assets["assets/<br/>CV, icons"]
        styles["styles.scss"]
        main["main.ts"]
        mainServer["main.server.ts"]
        server["server.ts"]
    end
    
    main --> appConfig
    appConfig --> app
    mainServer --> appConfigServer
    appConfigServer --> app
    server --> routesServer
    
    app --> features
    app --> layout
    app --> core
    
    core --> guards
    core --> interceptors
    core --> resolvers
    core --> services
    
    features --> about
    features --> hero
    features --> projects
    
    layout --> home
    layout --> navbar
    layout --> publicLayout
    layout --> whatsapp
