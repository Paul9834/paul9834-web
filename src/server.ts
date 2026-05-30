import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();

app.set('trust proxy', true);

const angularApp = new AngularNodeAppEngine({
  allowedHosts: [
    'paul9834.com',
    'www.paul9834.com',
    'api.paul9834.com',
    'localhost',
    '127.0.0.1',
    '65.38.98.151',
  ],
  trustProxyHeaders: true,
});

const SITE_URL = 'https://paul9834.com';
const NEWS_API_URL = 'https://api.paul9834.com/api/news?page=0&size=200';

type SitemapArticle = {
  slug?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  published?: boolean;
};

type NewsApiResponse = {
  articles?: SitemapArticle[];
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toDateOnly(value?: string): string {
  if (!value) {
    return new Date().toISOString().split('T')[0];
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split('T')[0];
  }

  return parsed.toISOString().split('T')[0];
}

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const apiResponse = await fetch(NEWS_API_URL, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!apiResponse.ok) {
      throw new Error(`Failed to fetch articles: ${apiResponse.status}`);
    }

    const data = (await apiResponse.json()) as NewsApiResponse;
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    const today = new Date().toISOString().split('T')[0];

    const staticUrls = [
      {
        loc: `${SITE_URL}/`,
        lastmod: today,
        priority: '1.0',
      },
      {
        loc: `${SITE_URL}/about`,
        lastmod: today,
        priority: '0.8',
      },
      {
        loc: `${SITE_URL}/blog`,
        lastmod: today,
        priority: '0.9',
      },
    ];

    const articleUrls = articles
      .filter((article) => Boolean(article?.slug))
      .map((article) => ({
        loc: `${SITE_URL}/blog/${article.slug}`,
        lastmod: toDateOnly(article.updatedAt || article.publishedAt || article.createdAt),
        priority: '0.8',
      }));

    const uniqueUrls = [...staticUrls, ...articleUrls].filter(
      (url, index, array) => array.findIndex((item) => item.loc === url.loc) === index,
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap.xml:', error);
    res.status(500).type('text/plain').send('Failed to generate sitemap.xml');
  }
});

app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
