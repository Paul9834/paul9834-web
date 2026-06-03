import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';

import { NewsArticle, NewsService } from '../../../core/services/news.service';

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
  private readonly sanitizer = inject(DomSanitizer);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly newsService = inject(NewsService);

  private readonly urlRegex = /(https?:\/\/\S+)/g;
  private readonly allowedTags = new Set([
    'P',
    'BR',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'A',
    'H2',
    'H3',
    'UL',
    'OL',
    'LI',
    'BLOCKQUOTE',
  ]);
  private readonly siteUrl = 'https://paul9834.com';

  readonly article = signal<NewsArticle | null>(null);
  readonly isLoading = signal(true);
  readonly isLiking = signal(false);
  readonly hasLiked = signal(false);
  readonly errorMessage = signal('');
  readonly likeErrorMessage = signal('');

  ngOnInit(): void {
    const resolvedArticle = this.route.snapshot.data['article'] as NewsArticle | undefined;

    if (!resolvedArticle) {
      this.errorMessage.set('No se pudo cargar la noticia.');
      this.isLoading.set(false);
      this.setFallbackSeo();
      return;
    }

    this.article.set(resolvedArticle);
    this.syncLikedState(resolvedArticle.slug);
    this.setArticleSeo(resolvedArticle);
    this.isLoading.set(false);
  }

  formatDate(value: string | null): string {
    if (!value?.trim()) {
      return 'Fecha no disponible';
    }

    const normalizedValue = this.normalizePublishedAt(value);
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  formatDateWithTime(value: string | null): string {
    if (!value?.trim()) {
      return 'Fecha no disponible';
    }

    const normalizedValue = this.normalizePublishedAt(value);
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'full',
      timeStyle: this.hasExplicitTime(value) ? 'short' : undefined,
      timeZone: 'America/Bogota',
    }).format(date);
  }

  formatPublishedAt(value: string | null): string {
    return this.formatDate(value);
  }

  formatPublishedTime(value: string | null): string {
    if (!value?.trim() || !this.hasExplicitTime(value)) {
      return '';
    }

    const normalizedValue = this.normalizePublishedAt(value);
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('es-CO', {
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  renderRichContent(content: string | null | undefined): SafeHtml {
    const sanitized = this.sanitizeRichContent(content ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
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

  private sanitizeRichContent(rawHtml: string): string {
    if (!rawHtml?.trim() || !isPlatformBrowser(this.platformId)) {
      return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    const sanitizeNode = (node: Node): void => {
      const children = Array.from(node.childNodes);

      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const element = child as HTMLElement;

          if (!this.allowedTags.has(element.tagName)) {
            const fragment = doc.createDocumentFragment();
            while (element.firstChild) {
              fragment.appendChild(element.firstChild);
            }
            element.replaceWith(fragment);
            continue;
          }

          Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();

            if (element.tagName === 'A' && name === 'href' && /^https?:\/\//i.test(value)) {
              element.setAttribute('href', value);
              element.setAttribute('target', '_blank');
              element.setAttribute('rel', 'noopener noreferrer');
              return;
            }

            element.removeAttribute(attribute.name);
          });

          sanitizeNode(element);
        } else if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
        }
      }
    };

    sanitizeNode(doc.body);

    return doc.body.innerHTML
      .replace(/<div>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<p>\s*<\/p>/gi, '')
      .trim();
  }

  likeArticle(): void {
    const currentArticle = this.article();

    if (!currentArticle || this.isLiking() || this.hasLiked()) {
      return;
    }

    this.isLiking.set(true);
    this.likeErrorMessage.set('');

    this.newsService
      .likeNews(currentArticle.slug)
      .pipe(finalize(() => this.isLiking.set(false)))
      .subscribe({
        next: (updatedArticle) => {
          this.article.set(updatedArticle);
          this.markArticleAsLiked(updatedArticle.slug);
          this.hasLiked.set(true);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error liking article:', error);
          this.likeErrorMessage.set('No se pudo registrar tu me gusta. Intenta nuevamente.');
        },
      });
  }

  private syncLikedState(slug: string): void {
    this.hasLiked.set(this.wasArticleLiked(slug));
  }

  private wasArticleLiked(slug: string): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    try {
      return localStorage.getItem(this.buildLikeStorageKey(slug)) === 'true';
    } catch {
      return false;
    }
  }

  private markArticleAsLiked(slug: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.buildLikeStorageKey(slug), 'true');
    } catch {
      // no-op
    }
  }

  private buildLikeStorageKey(slug: string): string {
    return `blog-liked-${slug}`;
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

  private setArticleSeo(article: NewsArticle): void {
    const pageTitle = `${article.title} | Blog | Paul Montealegre`;
    const description = article.description?.trim()
      ? article.description.trim()
      : 'Lee este artículo del blog de Paul Montealegre.';
    const canonicalUrl = `${this.siteUrl}/blog/${article.slug}`;
    const imageUrl = this.resolveSocialImageUrl(article.imageUrl);

    this.titleService.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'author', content: 'Kevin Paul Montealegre Melo' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Paul Montealegre' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_CO' });

    if (article.publishedAt) {
      this.meta.updateTag({
        property: 'article:published_time',
        content: article.publishedAt,
      });
    }

    if (article.category?.trim()) {
      this.meta.updateTag({
        property: 'article:section',
        content: article.category.trim(),
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

  private resolveSocialImageUrl(imageUrl: string | null | undefined): string {
    const fallbackImagePath = '/android-chrome-512x512.png';
    const normalizedImageUrl = imageUrl?.trim();

    if (!normalizedImageUrl) {
      return `${this.siteUrl}${fallbackImagePath}`;
    }

    if (/^https?:\/\//i.test(normalizedImageUrl)) {
      return normalizedImageUrl;
    }

    const normalizedPath = normalizedImageUrl.startsWith('/')
      ? normalizedImageUrl
      : `/${normalizedImageUrl}`;

    return `${this.siteUrl}${normalizedPath}`;
  }

  private setFallbackSeo(): void {
    const pageTitle = 'Blog | Paul Montealegre';
    const description = 'Noticias, artículos y actualizaciones del blog de Paul Montealegre.';
    const canonicalUrl = `${this.siteUrl}/blog`;
    const imageUrl = this.resolveSocialImageUrl(null);

    this.titleService.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'author', content: 'Kevin Paul Montealegre Melo' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:secure_url', content: imageUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'Paul Montealegre' });
    this.meta.updateTag({ property: 'og:locale', content: 'es_CO' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:url', content: canonicalUrl });

    this.setCanonicalUrl(canonicalUrl);
    this.removeStructuredData();
  }

  private setCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setStructuredData(article: NewsArticle, canonicalUrl: string, imageUrl: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.removeStructuredData();

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-structured-data';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: imageUrl,
      author: {
        '@type': 'Person',
        name: 'Kevin Paul Montealegre Melo',
      },
      publisher: {
        '@type': 'Person',
        name: 'Kevin Paul Montealegre Melo',
      },
      datePublished: article.publishedAt,
      mainEntityOfPage: canonicalUrl,
      url: canonicalUrl,
    });

    this.document.head.appendChild(script);
  }

  private removeStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const existingScript = this.document.getElementById('article-structured-data');
    existingScript?.remove();
  }
}
