import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Meta, Title } from '@angular/platform-browser';

import { NewsArticle, NewsService } from '../../../core/services/news.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly newsService = inject(NewsService);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly urlRegex = /(https?:\/\/[^\s]+)/g;
  private readonly siteUrl = 'https://paul9834.com';

  readonly article = signal<NewsArticle | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug?.trim()) {
      this.errorMessage.set('No se encontró el identificador de la noticia.');
      this.isLoading.set(false);
      this.setFallbackSeo();
      return;
    }

    this.loadArticle(slug);
  }

  loadArticle(slug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService.getBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.setArticleSeo(article);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading blog detail:', error);

        if (error.status === 404) {
          this.errorMessage.set('La noticia que buscas no existe o ya no está disponible.');
        } else if (error.status === 0) {
          this.errorMessage.set('No fue posible conectar con el servicio de noticias.');
        } else {
          this.errorMessage.set('No se pudo cargar la noticia.');
        }

        this.setFallbackSeo();
        this.isLoading.set(false);
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
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  linkifyContent(content: string): string {
    if (!content?.trim()) {
      return '';
    }

    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escaped
      .replace(this.urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  private setArticleSeo(article: NewsArticle): void {
    const pageTitle = `${article.title} | Blog | Paul Montealegre`;
    const description = article.description;
    const canonicalUrl = `${this.siteUrl}/blog/${article.slug}`;
    const imageUrl = article.imageUrl?.trim()
      ? article.imageUrl
      : `${this.siteUrl}/assets/og-image.jpg`;

    this.titleService.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Paul Montealegre' });

    if (article.publishedAt) {
      this.meta.updateTag({
        property: 'article:published_time',
        content: article.publishedAt,
      });
    }

    if (article.category?.trim()) {
      this.meta.updateTag({
        property: 'article:section',
        content: article.category,
      });
    }

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:url', content: canonicalUrl });

    this.setCanonicalUrl(canonicalUrl);
    this.setStructuredData(article, canonicalUrl, imageUrl);
  }

  private setFallbackSeo(): void {
    const pageTitle = 'Blog | Paul Montealegre';
    const description = 'Noticias, artículos y actualizaciones del blog de Paul Montealegre.';
    const canonicalUrl = `${this.siteUrl}/blog`;

    this.titleService.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Paul Montealegre' });
    this.meta.updateTag({ name: 'twitter:url', content: canonicalUrl });

    this.setCanonicalUrl(canonicalUrl);
    this.removeStructuredData();
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

  private setStructuredData(article: NewsArticle, canonicalUrl: string, imageUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: article.title,
      description: article.description,
      image: [imageUrl],
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
      articleSection: article.category,
      datePublished: article.publishedAt ?? undefined,
      dateModified: article.publishedAt ?? undefined,
      author: {
        '@type': 'Person',
        name: 'Kevin Paul Montealegre Melo',
        url: 'https://paul9834.com/about',
      },
      publisher: {
        '@type': 'Person',
        name: 'Kevin Paul Montealegre Melo',
        url: 'https://paul9834.com/',
      },
    };

    let script = document.querySelector(
      'script[type="application/ld+json"][data-seo="blog-detail"]',
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'blog-detail');
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(structuredData);
  }

  private removeStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const script = document.querySelector(
      'script[type="application/ld+json"][data-seo="blog-detail"]',
    );

    if (script) {
      script.remove();
    }
  }
}
