import {
  Component,
  HostListener,
  Inject,
  PLATFORM_ID,
  NgZone,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatDividerModule, TranslocoPipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private frameId?: number;
  private resizeTimeout?: ReturnType<typeof setTimeout>;
  private readonly reducedMotion: boolean;
  private heroElement?: HTMLElement;
  private heroTop = 0;
  private heroHeight = 0;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.reducedMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.heroElement = document.querySelector<HTMLElement>('.hero') ?? undefined;
    this.recalculateHeroMetrics();
    this.scheduleParallaxUpdate();
    window.addEventListener('load', this.handleWindowLoad, { once: true });

    this.resizeTimeout = setTimeout(() => {
      this.recalculateHeroMetrics();
      this.scheduleParallaxUpdate();
    }, 120);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('load', this.handleWindowLoad);

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) {
      return;
    }

    // Solo actualizar parallax cuando el hero está visible en el viewport
    if (!this.heroElement) {
      this.scheduleParallaxUpdate();
      return;
    }
    const rect = this.heroElement.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (inView) {
      this.scheduleParallaxUpdate();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) {
      return;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => {
      this.recalculateHeroMetrics();
      this.scheduleParallaxUpdate();
    }, 80);
  }

  private readonly handleWindowLoad = () => {
    this.recalculateHeroMetrics();
    this.scheduleParallaxUpdate();
  };

  private scheduleParallaxUpdate(): void {
    if (this.reducedMotion || this.frameId) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.frameId = requestAnimationFrame(() => {
        this.updateHeroParallax();
        this.frameId = undefined;
      });
    });
  }

  private recalculateHeroMetrics(): void {
    if (!this.heroElement) {
      return;
    }

    const rect = this.heroElement.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;

    this.heroTop = rect.top + scrollY;
    this.heroHeight = rect.height;
  }

  private updateHeroParallax(): void {
    if (!this.heroElement) {
      return;
    }

    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const heroBottom = this.heroTop + this.heroHeight;

    if (scrollY + viewportHeight < this.heroTop || scrollY > heroBottom) {
      this.heroElement.style.setProperty('--hero-shape-y-1', '0px');
      this.heroElement.style.setProperty('--hero-shape-y-2', '0px');
      return;
    }

    const relativeScroll = scrollY - this.heroTop;

    this.heroElement.style.setProperty('--hero-shape-y-1', `${(relativeScroll * -0.06).toFixed(2)}px`);
    this.heroElement.style.setProperty('--hero-shape-y-2', `${(relativeScroll * 0.04).toFixed(2)}px`);
  }
}
