import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HeroComponent } from '../../features/hero/hero.component';
import { ProjectsComponent } from '../../features/projects/projects.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, ProjectsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    const isSpanish = this.router.url.startsWith('/es');
    const canonicalUrl = isSpanish ? 'https://paul9834.com/es' : 'https://paul9834.com/';

    const pageTitle = isSpanish
      ? 'Kevin Paul Montealegre Melo | Ingeniero Mobile Senior'
      : 'Kevin Paul Montealegre Melo | Senior Mobile Engineer';

    const description = isSpanish
      ? 'Ingeniero Mobile Senior en Bogotá especializado en Android, iOS, Kotlin, Swift, Clean Architecture, apps fintech y productos móviles escalables usados por millones.'
      : 'Senior Mobile Engineer in Bogotá specializing in Android, iOS, Kotlin, Swift, Clean Architecture, fintech apps and scalable mobile products used by millions.';

    this.titleService.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: 'https://paul9834.com/assets/og-image.jpg' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://paul9834.com/assets/og-image.jpg' });

    this.setCanonicalUrl(canonicalUrl);
  }

  private setCanonicalUrl(url: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let link: HTMLLinkElement | null = document.querySelector('link[rel="canonical"]');

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
