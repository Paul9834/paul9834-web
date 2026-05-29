import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';

import { NewsArticle, NewsService } from '../../../core/services/news.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canonicalUrl = 'https://paul9834.com/blog';

  readonly articles = signal<NewsArticle[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    this.setPageSeo();
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService
      .getNews(0, 12)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.articles.set(response.articles);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading public news:', error);

          if (error.status === 0) {
            this.errorMessage.set('No fue posible conectar con el servicio de noticias.');
          } else {
            this.errorMessage.set('No se pudieron cargar las noticias publicadas.');
          }
        },
      });
  }

  formatPublishedAt(value: string | null): string {
    if (!value?.trim()) {
      return 'Fecha no disponible';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
    }).format(date);
  }

  private setPageSeo(): void {
    const pageTitle =
      'Blog de Kevin Paul Montealegre Melo | Mobile Engineering, Software Architecture and Tech';
    const description =
      'Blog with news, ideas and updates about Android, iOS, software architecture, fintech, backend integration and technology by Kevin Paul Montealegre Melo.';

    this.titleService.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: this.canonicalUrl });
    this.meta.updateTag({
      property: 'og:image',
      content: 'https://paul9834.com/assets/og-image.jpg',
    });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({
      name: 'twitter:image',
      content: 'https://paul9834.com/assets/og-image.jpg',
    });

    this.setCanonicalUrl(this.canonicalUrl);
  }

  private setCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
