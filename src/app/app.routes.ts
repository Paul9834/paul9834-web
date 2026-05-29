import { Routes } from '@angular/router';
import { HomeComponent } from './layout/home/home.component';
import { AboutComponent } from './features/about/about.component';
import { AdminLoginComponent } from './features/admin/admin-login/admin-login.component';
import { AdminNewsComponent } from './features/admin/admin-news/admin-news.component';
import { authGuard } from './core/guards/auth.guard';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';
import { BlogListComponent } from './features/blog/blog-list/blog-list.component';
import { BlogDetailComponent } from './features/blog/blog-details/blog-detail.component';
import { blogArticleResolver } from './core/resolvers/blog-article.resolver';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'about', component: AboutComponent },
    ],
  },
  { path: 'blog', component: BlogListComponent },
  {
    path: 'blog/:slug',
    component: BlogDetailComponent,
    resolve: {
      article: blogArticleResolver,
    },
  },

  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminNewsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
