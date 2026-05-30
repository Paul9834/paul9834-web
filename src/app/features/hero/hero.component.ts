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

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatDividerModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private ticking = false;
  private heroElement?: HTMLElement;
  private heroTop = 0;
  private heroHeight = 0;

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.heroElement = document.querySelector<HTMLElement>('.hero') ?? undefined;
    this.recalculateHeroMetrics();
    this.queueParallaxUpdate();
    window.addEventListener('load', this.handleWindowLoad, { once: true });
    setTimeout(() => {
      this.recalculateHeroMetrics();
      this.queueParallaxUpdate();
    }, 120);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) {
      return;
    }

    window.removeEventListener('load', this.handleWindowLoad);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) {
      return;
    }

    this.queueParallaxUpdate();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) {
      return;
    }

    this.recalculateHeroMetrics();
    this.queueParallaxUpdate();
  }

  private readonly handleWindowLoad = () => {
    this.recalculateHeroMetrics();
    this.queueParallaxUpdate();
  };

  private queueParallaxUpdate(): void {
    if (this.ticking) {
      return;
    }

    this.ticking = true;

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.updateHeroParallax();
        this.ticking = false;
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
      return;
    }

    const relativeScroll = scrollY - this.heroTop;

    this.heroElement.style.setProperty('--hero-shape-y-1', `${(relativeScroll * -0.1).toFixed(2)}px`);
    this.heroElement.style.setProperty('--hero-shape-y-2', `${(relativeScroll * 0.07).toFixed(2)}px`);
  }
}
