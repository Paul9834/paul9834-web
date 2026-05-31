import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  CreateNewsRequest,
  NewsArticle,
  NewsService,
  UpdateNewsRequest,
} from '../../../core/services/news.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit, OnDestroy {
  private readonly newsService = inject(NewsService);
  private readonly fb = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly articles = signal<NewsArticle[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly isEditorOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');
  readonly selectedArticle = signal<NewsArticle | null>(null);

  readonly selectedImageFile = signal<File | null>(null);
  readonly selectedImageName = signal('');
  readonly currentImageUrl = signal<string | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);

  readonly newsForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    slug: ['', [Validators.required, Validators.maxLength(180)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    content: ['', [Validators.required]],
    category: ['', [Validators.required, Validators.maxLength(80)]],
  });

  private readonly urlRegex = /(https?:\/\/[^\s]+)/g;

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.revokeImagePreviewUrl();
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService.getAdminNews(0, 20).subscribe({
      next: (response) => {
        const sorted = [...response.articles].sort((a, b) => {
          if (a.published !== b.published) {
            return a.published ? 1 : -1;
          }

          const leftDate = a.published
            ? this.normalizeSortableDate(a.publishedAt)
            : this.normalizeSortableDate(a.createdAt);
          const rightDate = b.published
            ? this.normalizeSortableDate(b.publishedAt)
            : this.normalizeSortableDate(b.createdAt);

          return rightDate.localeCompare(leftDate);
        });

        this.articles.set(sorted);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading admin news:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Tu sesión no es válida o no tienes permisos para consultar noticias.',
          );
        } else if (error.status === 0) {
          this.errorMessage.set('No fue posible conectar con el backend.');
        } else {
          this.errorMessage.set('No se pudieron cargar las noticias del panel admin.');
        }

        this.isLoading.set(false);
      },
    });
  }

  openCreateEditor(): void {
    this.selectedArticle.set(null);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(null);
    this.revokeImagePreviewUrl();

    this.newsForm.reset({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
    });

    this.isEditorOpen.set(true);
  }

  openEditEditor(article: NewsArticle): void {
    this.selectedArticle.set(article);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(article.imageUrl?.trim() ? article.imageUrl : null);
    this.revokeImagePreviewUrl();

    this.newsForm.reset({
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: article.content,
      category: article.category,
    });

    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
    this.selectedArticle.set(null);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(null);
    this.revokeImagePreviewUrl();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile.set(file);
    this.selectedImageName.set(file?.name ?? '');
    this.revokeImagePreviewUrl();

    if (file && this.isBrowser) {
      const previewUrl = URL.createObjectURL(file);
      this.imagePreviewUrl.set(previewUrl);
    }
  }

  publishArticle(article: NewsArticle): void {
    if (article.published) {
      return;
    }

    this.errorMessage.set('');
    this.submitError.set('');

    this.newsService.publishNews(article.slug).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error publishing news:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Tu sesión no es válida o no tienes permisos para publicar noticias.',
          );
        } else {
          this.errorMessage.set('No se pudo publicar la noticia.');
        }
      },
    });
  }

  formatPublishedAt(value: string | null): string {
    if (!value?.trim()) {
      return 'Aún no publicado';
    }

    const date = new Date(this.normalizeSortableDate(value));

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  formatCreatedAt(value: string | null): string {
    if (!value?.trim()) {
      return 'Fecha no disponible';
    }

    const date = new Date(this.normalizeSortableDate(value));

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  private normalizeSortableDate(value: string | null): string {
    const trimmed = value?.trim();

    if (!trimmed) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T12:00:00`;
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.replace(' ', 'T').replace(/\.\d+$/, '');
    }

    return trimmed;
  }

  deleteArticle(article: NewsArticle): void {
    if (!this.isBrowser) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar la noticia "${article.title}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.submitError.set('');

    this.newsService.deleteNews(article.slug).subscribe({
      next: () => {
        if (this.selectedArticle()?.slug === article.slug) {
          this.closeEditor();
        }

        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting news:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Tu sesión no es válida o no tienes permisos para eliminar noticias.',
          );
        } else {
          this.errorMessage.set('No se pudo eliminar la noticia.');
        }
      },
    });
  }

  linkifyContent(content: string): string {
    if (!content?.trim()) {
      return '';
    }

    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escaped
      .replace(this.urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  submitForm(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    const selected = this.selectedArticle();

    if (!selected && !this.selectedImageFile()) {
      this.submitError.set('Debes seleccionar una imagen para crear la noticia.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    const raw = this.newsForm.getRawValue();

    if (selected) {
      const payload: UpdateNewsRequest = {
        title: raw.title,
        description: raw.description,
        content: raw.content,
        category: raw.category,
        imageUrl: this.currentImageUrl(),
      };

      this.newsService.updateNews(selected.slug, payload, this.selectedImageFile()).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeEditor();
          this.loadArticles();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating news:', error);
          this.submitError.set('No se pudo actualizar la noticia.');
          this.isSubmitting.set(false);
        },
      });

      return;
    }

    const payload: CreateNewsRequest = {
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      content: raw.content,
      category: raw.category,
    };


    this.newsService.createNews(payload, this.selectedImageFile()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeEditor();
        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating news:', error.status, error.error, error);
        this.submitError.set(error.error?.error ?? 'No se pudo crear la noticia.');
        this.isSubmitting.set(false);
      },
    });
  }

  private revokeImagePreviewUrl(): void {
    const currentPreview = this.imagePreviewUrl();

    if (currentPreview && this.isBrowser) {
      URL.revokeObjectURL(currentPreview);
    }

    this.imagePreviewUrl.set(null);
  }
}
