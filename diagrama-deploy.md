# Diagrama de Despliegue - KP Portfolio

```mermaid
flowchart LR
    subgraph Dev["Desarrollo (Local)"]
        DevCode["Cienta en VS Code<br/>Angular Dev Server<br/>ng serve :4200"]
        LocalAPI["Backend Local<br/>:8080"]
    end
    
    subgraph CI["Integracion Continua"]
        Git["GitHub Repository<br/>kp_portfolio"]
        Actions["GitHub Actions<br/>CI/CD Pipeline"]
        Build["Build Production<br/>ng build --configuration production"]
    end
    
    subgraph Prod["Produccion (VPS)"]
        VPS["VPS DigitalOcean<br/>Ubuntu + Node.js"]
        SSR["Node SSR Server<br/>server.mjs :4000"]
        Nginx["Nginx Reverse Proxy<br/>:80 HTTP :443 HTTPS"]
        Domain["paul9834.com"]
    end
    
    DevCode -->|Push| Git
    Git -->|Trigger| Actions
    Actions --> Build
    Build -->|SCP/Rsync| VPS
    VPS --> SSR
    SSR --> Nginx
    Nginx --> Domain
    
    style Dev fill:#e3f2fd
    style CI fill:#fff3e0
    style Prod fill:#e8f5e9
