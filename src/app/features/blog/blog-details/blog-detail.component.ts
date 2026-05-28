import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

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
  private readonly urlRegex = /(https?:\/\/[^\s]+)/g;

  readonly article = signal<NewsArticle | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug?.trim()) {
      this.errorMessage.set('No se encontró el identificador de la noticia.');
      this.isLoading.set(false);
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
}
