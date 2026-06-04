import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  getTranslation(lang: string): Observable<Translation> {
    if (isPlatformBrowser(this.platformId)) {
      return this.http.get<Translation>(`/i18n/${lang}.json`);
    }

    try {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(process.cwd(), 'public', 'i18n', `${lang}.json`);
      const content = fs.readFileSync(filePath, 'utf-8');
      return of(JSON.parse(content) as Translation);
    } catch {
      return this.http.get<Translation>(`/i18n/${lang}.json`);
    }
  }
}
