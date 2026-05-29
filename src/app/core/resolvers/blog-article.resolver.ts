import { inject } from '@angular/core';

import { ResolveFn } from '@angular/router';
import { NewsArticle, NewsService } from '../services/news.service';

export const blogArticleResolver: ResolveFn<NewsArticle> = (route) => {
  const newsService = inject(NewsService);
  const slug = route.paramMap.get('slug')?.trim();

  if (!slug) {
    throw new Error('No se encontró el slug del artículo.');
  }

  return newsService.getBySlug(slug);
};
