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
import { Meta, Title } from '@angular/platform-browser';

import { NewsArticle } from '../../../core/services/news.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly urlRegex = /(https?:\/\/[^\s]+)/g;
  private readonly siteUrl = 'https://paul9834.com';

  readonly article = signal<NewsArticle | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const resolvedArticle = this.route.snapshot.data['article'] as NewsArticle | undefined;

    if (!resolvedArticle) {
      this.errorMessage.set('No se pudo cargar la noticia.');
      this.isLoading.set(false);
      this.setFallbackSeo();
      return;
    }

    this.article.set(resolvedArticle);
    this.setArticleSeo(resolvedArticle);
    this.isLoading.set(false);
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
    this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
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
