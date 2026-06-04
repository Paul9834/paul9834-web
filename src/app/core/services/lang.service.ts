import { Injectable, signal, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslocoService } from '@jsverse/transloco';

export type AppLang = 'en' | 'es';

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly router = inject(Router);
  private readonly transloco = inject(TranslocoService);

  readonly activeLang = signal<AppLang>('en');

  init(): void {
    this.detectLangFromUrl(this.router.url);

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(e => this.detectLangFromUrl((e as NavigationEnd).urlAfterRedirects));
  }

  switchTo(lang: AppLang): void {
    if (this.activeLang() === lang) return;

    const currentUrl = this.router.url;

    if (lang === 'es') {
      const target = currentUrl === '/' ? '/es' : `/es${currentUrl}`;
      this.router.navigateByUrl(target);
    } else {
      const target = currentUrl.replace(/^\/es/, '') || '/';
      this.router.navigateByUrl(target);
    }
  }

  private detectLangFromUrl(url: string): void {
    const lang: AppLang = url.startsWith('/es') ? 'es' : 'en';
    if (this.activeLang() !== lang) {
      this.activeLang.set(lang);
      this.transloco.setActiveLang(lang);
    }
  }
}
