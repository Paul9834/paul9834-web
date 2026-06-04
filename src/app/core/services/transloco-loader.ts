import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, from, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  getTranslation(lang: string): Observable<Translation> {
    if (isPlatformBrowser(this.platformId)) {
      // Browser: normal HTTP request
      return this.http.get<Translation>(`/i18n/${lang}.json`);
    }

    // Server (SSR/Prerender): read file synchronously from disk
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'i18n', `${lang}.json`);
      const content = fs.readFileSync(filePath, 'utf-8');
      return of(JSON.parse(content) as Translation);
    } catch {
      // Fallback to HTTP if file read fails
      return this.http.get<Translation>(`/i18n/${lang}.json`);
    }
  }
}
