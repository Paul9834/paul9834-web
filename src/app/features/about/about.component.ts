import {
  AfterViewInit,
  Component,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly ngZone = inject(NgZone);
  private readonly canonicalUrl = 'https://paul9834.com/about';
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly reducedMotion =
    this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  private parallaxFrame?: number;

  ngOnInit(): void {
    const pageTitle = 'About Kevin Paul Montealegre Melo | Senior Mobile Engineer';
    const description =
      'About Kevin Paul Montealegre Melo, Senior Mobile Engineer based in Bogotá with experience in Android, iOS, Kotlin, Swift, Clean Architecture, fintech and enterprise mobile products.';

    this.titleService.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'profile' });
    this.meta.updateTag({ property: 'og:url', content: this.canonicalUrl });
    this.meta.updateTag({ property: 'og:image', content: 'https://i.imgur.com/v3Gxdlp.jpeg' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: 'https://i.imgur.com/v3Gxdlp.jpeg' });

    this.setCanonicalUrl(this.canonicalUrl);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser || this.reducedMotion) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => this.updateParallax());
    });
  }

  ngOnDestroy(): void {
    if (this.parallaxFrame) {
      cancelAnimationFrame(this.parallaxFrame);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser || this.reducedMotion) {
      return;
    }

    this.scheduleParallaxUpdate();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser || this.reducedMotion) {
      return;
    }

    this.scheduleParallaxUpdate();
  }

  private scheduleParallaxUpdate(): void {
    if (this.parallaxFrame) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.parallaxFrame = requestAnimationFrame(() => {
        this.updateParallax();
        this.parallaxFrame = undefined;
      });
    });
  }

  private updateParallax(): void {
    const section = document.querySelector<HTMLElement>('.about-section');
    const card = document.querySelector<HTMLElement>('.about-side');

    if (!section || !card) {
      return;
    }

    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;

    if (rect.bottom < 0 || rect.top > viewH) {
      card.style.setProperty('--about-card-offset', '0px');
      return;
    }

    const progress = (viewH - rect.top) / (viewH + rect.height);
    const isMobile = window.innerWidth <= 768;
    const intensity = isMobile ? 28 : 52;
    const offset = (progress - 0.5) * intensity;

    card.style.setProperty('--about-card-offset', `${offset.toFixed(2)}px`);
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
