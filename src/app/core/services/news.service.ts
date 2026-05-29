import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  published: boolean;
  publishedAt: string | null;
  likesCount: number;
}


export interface NewsListResponse {
  articles: NewsArticle[];
  page: number;
  size: number;
  topic: string;
}

export interface CreateNewsRequest {
  title: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  published?: boolean;
  publishedAt?: string | null;
}

export interface UpdateNewsRequest {
  title: string;
  description: string;
  content: string;
  category: string;
  imageUrl?: string | null;
  published?: boolean;
  publishedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/news`;

  constructor(private http: HttpClient) {}

  getAdminNews(page = 0, size = 20): Observable<NewsListResponse> {
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<NewsListResponse>(`${this.baseUrl}/admin`, { params }).pipe(
      map((response) => ({
        ...response,
        articles: response.articles.map((article) => this.normalizeArticle(article)),
      })),
    );
  }

  getNews(page = 0, size = 10, category?: string): Observable<NewsListResponse> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (category && category.trim()) {
      params = params.set('category', category.trim());
    }

    return this.http.get<NewsListResponse>(this.baseUrl, { params }).pipe(
      map((response) => ({
        ...response,
        articles: response.articles.map((article) => this.normalizeArticle(article)),
      })),
    );
  }

  getBySlug(slug: string): Observable<NewsArticle> {
    return this.http
      .get<NewsArticle>(`${this.baseUrl}/${slug}`)
      .pipe(map((article) => this.normalizeArticle(article)));
  }

  createNews(payload: CreateNewsRequest, imageFile?: File | null): Observable<NewsArticle> {
    const formData = this.buildNewsFormData(payload, imageFile);

    return this.http
      .post<NewsArticle>(this.baseUrl, formData)
      .pipe(map((article) => this.normalizeArticle(article)));
  }

  likeNews(slug: string): Observable<NewsArticle> {
    return this.http
      .patch<NewsArticle>(`${this.baseUrl}/${slug}/like`, {})
      .pipe(map((article) => this.normalizeArticle(article)));
  }


  updateNews(
    slug: string,
    payload: UpdateNewsRequest,
    imageFile?: File | null,
  ): Observable<NewsArticle> {
    const normalizedPayload: UpdateNewsRequest = {
      ...payload,
      imageUrl: imageFile ? null : (payload.imageUrl ?? null),
    };

    const formData = this.buildNewsFormData(normalizedPayload, imageFile);

    return this.http
      .put<NewsArticle>(`${this.baseUrl}/${slug}`, formData)
      .pipe(map((article) => this.normalizeArticle(article)));
  }

  deleteNews(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${slug}`);
  }

  publishNews(slug: string): Observable<NewsArticle> {
    return this.http
      .patch<NewsArticle>(`${this.baseUrl}/${slug}/publish`, {})
      .pipe(map((article) => this.normalizeArticle(article)));
  }

  private buildNewsFormData(
    payload: CreateNewsRequest | UpdateNewsRequest,
    imageFile?: File | null,
  ): FormData {
    const formData = new FormData();

    formData.append('article', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

    if (imageFile) {
      formData.append('image', imageFile);
    }

    return formData;
  }

  private normalizeArticle(article: NewsArticle): NewsArticle {
    return {
      ...article,
      imageUrl: this.normalizeImageUrl(article.imageUrl),
      publishedAt: article.publishedAt?.trim() ? article.publishedAt : null,
      likesCount: Number(article.likesCount ?? 0),
    };
  }

  private normalizeImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl?.trim()) {
      return '';
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('/')) {
      return `${environment.apiBaseUrl}${imageUrl}`;
    }

    return `${environment.apiBaseUrl}/${imageUrl}`;
  }
}
