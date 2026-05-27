import { Routes } from '@angular/router';
import { HomeComponent } from './layout/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },

  // Mock temporal mientras construimos blog y admin real
  { path: 'blog', component: HomeComponent },
  { path: 'blog/:slug', component: HomeComponent },

  // Login real que ya estás construyendo
  { path: 'admin/login', component: AdminLoginComponent },

  // Mock temporal del panel admin, por ahora redirigido al login
  { path: 'admin', component: AdminLoginComponent },

  { path: '**', redirectTo: '' },
];
