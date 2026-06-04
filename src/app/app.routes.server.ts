import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // English
  { path: '',       renderMode: RenderMode.Prerender },
  { path: 'about',  renderMode: RenderMode.Prerender },
  { path: 'cv',     renderMode: RenderMode.Prerender },
  // Spanish
  { path: 'es',         renderMode: RenderMode.Prerender },
  { path: 'es/about',   renderMode: RenderMode.Prerender },
  { path: 'es/cv',      renderMode: RenderMode.Prerender },
  // Blog
  { path: 'blog',       renderMode: RenderMode.Prerender },
  { path: 'blog/:slug', renderMode: RenderMode.Server },
  // Fallback
  { path: '**',         renderMode: RenderMode.Server },
];
