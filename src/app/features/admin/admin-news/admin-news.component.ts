import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class AdminNewsComponent implements OnInit {
  private readonly newsService = inject(NewsService);
  private readonly fb = inject(FormBuilder);

  readonly articles = signal<NewsArticle[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly isEditorOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');
  readonly selectedArticle = signal<NewsArticle | null>(null);

  readonly newsForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    slug: ['', [Validators.required, Validators.maxLength(180)]],
    description: ['', [Validators.required, Validators.maxLength(320)]],
    content: ['', [Validators.required]],
    category: ['', [Validators.required, Validators.maxLength(80)]],
    imageUrl: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService.getAdminNews(0, 20).subscribe({
      next: (response) => {
        this.articles.set(response.articles);
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
    this.newsForm.reset({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
      imageUrl: '',
    });
    this.isEditorOpen.set(true);
  }

  openEditEditor(article: NewsArticle): void {
    this.selectedArticle.set(article);
    this.submitError.set('');
    this.newsForm.reset({
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: article.content,
      category: article.category,
      imageUrl: article.imageUrl,
    });
    this.isEditorOpen.set(true);
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
    this.selectedArticle.set(null);
    this.submitError.set('');
  }

  submitForm(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    const raw = this.newsForm.getRawValue();
    const selected = this.selectedArticle();

    if (selected) {
      const payload: UpdateNewsRequest = {
        title: raw.title,
        description: raw.description,
        content: raw.content,
        category: raw.category,
        imageUrl: raw.imageUrl,
      };

      this.newsService.updateNews(selected.slug, payload).subscribe({
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
      imageUrl: raw.imageUrl,
    };

    this.newsService.createNews(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeEditor();
        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating news:', error);
        this.submitError.set('No se pudo crear la noticia.');
        this.isSubmitting.set(false);
      },
    });
  }
}
