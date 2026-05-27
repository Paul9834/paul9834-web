import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface NewsArticle {
  slug: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  category: string;
  published: boolean;
  publishedAt: string | null;
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
  imageUrl: string;
  published?: boolean;
  publishedAt?: string | null;
}

export interface UpdateNewsRequest {
  title: string;
  description: string;
  content: string;
  category: string;
  imageUrl: string;
  published?: boolean;
  publishedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly baseUrl = '/api/news';

  constructor(private http: HttpClient) {}

  getNews(page = 0, size = 10, category?: string): Observable<NewsListResponse> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (category && category.trim()) {
      params = params.set('category', category.trim());
    }

    return this.http
      .get<NewsListResponse>(this.baseUrl, { params })
      .pipe(map(response => ({
        ...response,
        articles: response.articles.map(article => this.normalizeArticle(article)),
      })));
  }

  getBySlug(slug: string): Observable<NewsArticle> {
    return this.http
      .get<NewsArticle>(`${this.baseUrl}/${slug}`)
      .pipe(map(article => this.normalizeArticle(article)));
  }

  createNews(payload: CreateNewsRequest): Observable<NewsArticle> {
    return this.http
      .post<NewsArticle>(this.baseUrl, payload)
      .pipe(map(article => this.normalizeArticle(article)));
  }

  updateNews(slug: string, payload: UpdateNewsRequest): Observable<NewsArticle> {
    return this.http
      .put<NewsArticle>(`${this.baseUrl}/${slug}`, payload)
      .pipe(map(article => this.normalizeArticle(article)));
  }

  deleteNews(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${slug}`);
  }

  publishNews(slug: string): Observable<NewsArticle> {
    return this.http
      .patch<NewsArticle>(`${this.baseUrl}/${slug}/publish`, {})
      .pipe(map(article => this.normalizeArticle(article)));
  }

  private normalizeArticle(article: NewsArticle): NewsArticle {
    return {
      ...article,
      publishedAt: article.publishedAt?.trim() ? article.publishedAt : null,
    };
  }
}
