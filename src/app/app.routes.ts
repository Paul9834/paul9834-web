import { Routes } from '@angular/router';
import { HomeComponent } from './layout/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';
import { AdminNewsComponent } from './features/admin/admin-news/admin-news.component';
import { authGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },

      // Mock temporal mientras construimos blog público real
      { path: 'blog', component: HomeComponent },
      { path: 'blog/:slug', component: HomeComponent },
    ],
  },

  // Admin fuera del layout público
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminNewsComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '' },
];
