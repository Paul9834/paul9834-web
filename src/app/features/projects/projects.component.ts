import {
  Component,
  HostListener,
  AfterViewInit,
  OnDestroy,
  OnInit,
  Inject,
  PLATFORM_ID,
  NgZone,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';

interface Project {
  key: string;
  title: string;
  chronology: string;
  startDate: Date;
  techStack: string[];
  image: string;
  achievementCount: number;
  link?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    TranslocoPipe,
    TranslocoDirective,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('projectsRail') private projectsRail?: ElementRef<HTMLElement>;

  private readonly isBrowser: boolean;
  private observer?: IntersectionObserver;
  private parallaxFrame?: number;
  private resizeTimeout?: ReturnType<typeof setTimeout>;
  private readonly reducedMotion: boolean;

  readonly skeletonSlides = Array.from({ length: 3 });
  isLoading = false;

  readonly projects: Project[] = [
    {
      key: 'nolocreas',
      title: '#NoLoCreas',
      chronology: 'Aug 2018 - Dec 2018',
      startDate: new Date('2018-08-01'),
      techStack: ['Java', 'Firebase', 'Android SDK', 'Material Design', 'Web Security'],
      image: 'https://i.imgur.com/iy5LCDq.png',
      achievementCount: 4,
      link: 'https://apkpure.com/nolocreas/com.luminosity.apps.nolocreas',
    },
    {
      key: 'gopoli',
      title: 'GoPoli Institutional App',
      chronology: 'May 2019 - Sep 2020',
      startDate: new Date('2019-05-01'),
      techStack: [
        'Java',
        'Kotlin',
        'Android SDK',
        'OAuth2/OIDC',
        'FCM',
        'Android Services',
        'Hardware Sensors',
        'Step Counter',
        'Material Design',
      ],
      image: 'https://i.imgur.com/qUwtGbw.png',
      achievementCount: 5,
      link: 'https://github.com/paul9834',
    },
    {
      key: 'androidtv',
      title: 'Android TV & IPTV Streaming Research',
      chronology: 'Aug 2019 - Oct 2020',
      startDate: new Date('2019-08-01'),
      techStack: ['Kotlin', 'Java', 'Android TV', 'ExoPlayer', 'IPTV', 'M3U8', 'Media Streaming'],
      image: 'https://i.imgur.com/ewrFlN6.jpeg',
      achievementCount: 4,
      link: 'https://github.com/paul9834',
    },
    {
      key: 'qinaya',
      title: 'Qinaya Cloud Desktop',
      chronology: 'Oct 2020 - Jan 2022',
      startDate: new Date('2020-10-01'),
      techStack: [
        'Kotlin',
        'Java',
        'Android SDK',
        'Remote Desktop',
        'Networking',
        'Authentication',
        'Performance Optimization',
        'Security',
      ],
      image: 'https://i.imgur.com/m6Tyfa2.png',
      achievementCount: 4,
      link: 'https://github.com/paul9834',
    },
    {
      key: 'daviplata',
      title: 'DaviPlata Financial App (Valid)',
      chronology: 'Jun 2022 - Aug 2024',
      startDate: new Date('2022-06-01'),
      techStack: ['Kotlin', 'Java', 'Android SDK', 'Performance Optimization', 'Security'],
      image: 'https://i.imgur.com/4wvSkzx.jpeg',
      achievementCount: 3,
      link: 'https://play.google.com/store/apps/details?id=com.davivienda.daviplataapp',
    },
    {
      key: 'sibel',
      title: 'SIBEL Biometric Solution (Grupo ASD)',
      chronology: 'May 2025 - Dec 2025',
      startDate: new Date('2025-05-01'),
      techStack: ['Android SDK', 'BMAPI SDK', 'Hardware Integration', 'Kotlin', 'Java'],
      image: 'https://i.imgur.com/1UvlqLD.jpeg',
      achievementCount: 3,
      link: 'https://github.com/paul9834',
    },
    {
      key: 'dinastia',
      title: 'Dinast\u00eda Mascotas (VacunasPet)',
      chronology: 'Dec 2025 - Present',
      startDate: new Date('2025-12-01'),
      techStack: ['Swift', 'Kotlin', 'Spring Boot', 'REST APIs', 'iOS SDK'],
      image: 'https://i.imgur.com/LFqB4es.png',
      achievementCount: 3,
      link: 'https://github.com/paul9834',
    },
  ].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.reducedMotion =
      this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngOnInit(): void {}

  achievementRange(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  scrollProjectsRail(): void {
    const rail = this.projectsRail?.nativeElement;
    if (!rail) return;
    const scrollAmount = Math.max(rail.clientWidth * 0.8, 320);
    rail.scrollBy({ left: scrollAmount, behavior: this.reducedMotion ? 'auto' : 'smooth' });
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.setupIntersectionObserver();
        this.scheduleParallaxUpdate();
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.parallaxFrame) cancelAnimationFrame(this.parallaxFrame);
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
  }

  private setupIntersectionObserver(): void {
    const items = document.querySelectorAll<HTMLElement>('.animated-on-scroll');
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' },
    );
    items.forEach((item) => this.observer?.observe(item));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) return;
    this.scheduleParallaxUpdate();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser) return;
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.scheduleParallaxUpdate(), 80);
  }

  private scheduleParallaxUpdate(): void {
    if (this.reducedMotion || this.parallaxFrame) return;
    this.ngZone.runOutsideAngular(() => {
      this.parallaxFrame = requestAnimationFrame(() => {
        this.updateParallax();
        this.parallaxFrame = undefined;
      });
    });
  }

  private updateParallax(): void {
    const images = document.querySelectorAll<HTMLElement>('.parallax-image');
    images.forEach((img) => {
      const rect = img.closest('.project-image-shell')?.getBoundingClientRect();
      if (!rect) return;
      const vh = window.innerHeight;
      if (rect.bottom < 0 || rect.top > vh) return;
      const progress = 1 - (rect.top + rect.height / 2) / vh;
      img.style.transform = `translateY(${(progress * 30).toFixed(2)}px) scale(1.12)`;
    });
  }
}
