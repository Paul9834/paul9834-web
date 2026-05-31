import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';

import { NewsArticle, NewsService } from '../../../core/services/news.service';

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
  private readonly document = inject(DOCUMENT);
  private readonly canonicalUrl = 'https://paul9834.com/blog';

  readonly articles = signal<NewsArticle[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly loadedImages = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.setPageSeo();
    this.loadNews();
  }

  loadNews(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService.getNews(0, 12).subscribe({
      next: (response) => {
        this.articles.set(response.articles);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading public news:', error);

        if (error.status === 0) {
          this.errorMessage.set('No fue posible conectar con el servicio de noticias.');
        } else {
          this.errorMessage.set('No se pudieron cargar las noticias publicadas.');
        }

        this.isLoading.set(false);
      },
    });
  }

  formatDate(value: string | null): string {
    if (!value?.trim()) {
      return '--';
    }

    const normalizedValue = this.normalizePublishedAt(value);
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return this.extractDateLabel(value);
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  onImageLoad(slug: string): void {
    const current = this.loadedImages();
    const next = new Set(current);
    next.add(slug);
    this.loadedImages.set(next);
  }

  isImageLoaded(slug: string): boolean {
    return this.loadedImages().has(slug);
  }

  latestArticleDate(): string {
    const articles = this.articles();

    if (!articles.length) {
      return '--';
    }

    const latest = [...articles]
      .filter((article) => !!article.publishedAt?.trim())
      .sort((a, b) => {
        const left = this.normalizePublishedAt(a.publishedAt ?? '');
        const right = this.normalizePublishedAt(b.publishedAt ?? '');
        return right.localeCompare(left);
      })[0];

    if (!latest?.publishedAt) {
      return '--';
    }

    return this.formatDate(latest.publishedAt);
  }

  totalLikes(): string {
    const total = this.articles().reduce((sum, article) => sum + article.likesCount, 0);
    return total.toString();
  }

  readingLabel(): string {
    const count = this.articles().length;

    if (!count) {
      return '--';
    }

    return count === 1 ? '1 lectura' : `${count} lecturas`;
  }

  private extractDateLabel(value: string): string {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) {
      return value;
    }

    const [, year, month, day] = match;
    return `${day}/${month}/${year}`;
  }

  private normalizePublishedAt(value: string): string {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T12:00:00`;
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.replace(' ', 'T').replace(/\.\d+$/, '');
    }

    return trimmed;
  }

  private hasExplicitTime(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(value.trim());
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
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
