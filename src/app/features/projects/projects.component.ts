import {
  Component,
  HostListener,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface Project {
  title: string;
  role: string;
  chronology: string;
  startDate: Date;
  description: string;
  techStack: string[];
  image: string;
  achievements: string[];
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
  ],
  templateUrl: './projects.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  private readonly isBrowser: boolean;
  private observer?: IntersectionObserver;
  private parallaxFrame?: number;
  private resizeTimeout?: ReturnType<typeof setTimeout>;
  private readonly reducedMotion: boolean;

  readonly skeletonSlides = Array.from({ length: 3 });
  isLoading = false;

  projects: Project[] = [
    {
      title: 'GoPoli Institutional App',
      role: 'Android Developer',
      chronology: 'May 2019 - Sep 2020',
      startDate: new Date('2019-05-01'),
      description:
        'Institutional Android application for Politécnico Grancolombiano featuring campus services, OAuth2/OIDC authentication, hardware sensor integration, and Android background services.',
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
      achievements: [
        'Led development and release, designing a clean, Material Design-compliant UI/UX.',
        'Integrated Android hardware sensors including step counter functionality for activity tracking features.',
        'Implemented Android Services and background processing for persistent application tasks and notifications.',
        'Integrated third-party APIs including OAuth2/OIDC authentication, academic systems, and Firebase Cloud Messaging.',
        'Performed testing, debugging, and performance optimisation across multiple Android versions and devices.',
      ],
      link: 'https://github.com/paul9834',
    },
    {
      title: 'Android TV & IPTV Streaming Research',
      role: 'Android Developer',
      chronology: 'Aug 2019 - Oct 2020',
      startDate: new Date('2019-08-01'),
      description:
        'Independent research and development focused on Android TV media streaming technologies using ExoPlayer and IPTV protocols.',
      techStack: ['Kotlin', 'Java', 'Android TV', 'ExoPlayer', 'IPTV', 'M3U8', 'Media Streaming'],
      image: 'https://i.sstatic.net/zegNf.jpg',
      achievements: [
        'Implemented adaptive video streaming using ExoPlayer for Android TV environments.',
        'Worked with IPTV M3U8 playlists and live media streaming playback.',
        'Explored buffering optimisation, media session handling, and playback performance.',
        'Tested streaming compatibility across different Android TV devices and network conditions.',
      ],
      link: 'https://github.com/paul9834',
    },
    {
      title: 'Qinaya Cloud Desktop',
      role: 'Android Developer',
      chronology: 'Oct 2020 - Jan 2022',
      startDate: new Date('2020-10-01'),
      description:
        'Android application focused on providing low-cost cloud computer access through subscription-based remote desktop services.',
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
      achievements: [
        'Developed Android features for cloud-based remote desktop access and subscription management.',
        'Worked on secure authentication flows and stable communication between Android clients and remote systems.',
        'Optimised application performance and connection stability across different Android devices and network conditions.',
        'Collaborated on improving user experience for low-latency remote access sessions.',
      ],
      link: 'https://github.com/paul9834',
    },
    {
      title: 'DaviPlata Financial App (Valid)',
      role: 'Android Developer',
      chronology: 'Jun 2022 - Aug 2024',
      startDate: new Date('2022-06-01'),
      description:
        "Development and maintenance of key features for Colombia's most-used financial app, serving over 18 million active users.",
      techStack: ['Kotlin', 'Java', 'Android SDK', 'Performance Optimization', 'Security'],
      image: 'https://i.imgur.com/4wvSkzx.jpeg',
      achievements: [
        'Ensured the stability, security, and smooth processing of millions of daily transactions on Android and Huawei builds.',
        'Drove performance optimisation and incident resolution.',
        'Delivered continuous improvements to the UI and integrations with banking services.',
      ],
      link: 'https://play.google.com/store/apps/details?id=com.davivienda.daviplataapp',
    },
    {
      title: 'SIBEL Biometric Solution (Grupo ASD)',
      role: 'Senior Android Developer',
      chronology: 'May 2025 - Dec 2025',
      startDate: new Date('2025-05-01'),
      description:
        'Specialised biometric solution deployed on Aratek Marshall 8 tablets for industrial environments.',
      techStack: ['Android SDK', 'BMAPI SDK', 'Hardware Integration', 'Kotlin', 'Java'],
      image: 'https://i.imgur.com/1UvlqLD.jpeg',
      achievements: [
        'Integrated BMAPI SDK for fingerprint capture, MRZ reading, and QR code scanning.',
        'Optimised performance, stability, and power management for industrial Android devices.',
        'Contributed to PoC testing and UI adaptation across varied screen form factors.',
      ],
      link: 'https://github.com/paul9834',
    },
    {
      title: 'Dinastía Mascotas (VacunasPet) - Pet Management App',
      role: 'Senior Developer',
      chronology: 'Dec 2025 - Present',
      startDate: new Date('2025-12-01'),
      description:
        'Native iOS application for pet management with a focus on smooth user journeys and high-performance API integrations.',
      techStack: ['Swift', 'Kotlin', 'Spring Boot', 'REST APIs', 'iOS SDK'],
      image: 'https://i.imgur.com/LFqB4es.png',
      achievements: [
        'Developed core pet management features adhering to Apple Human Interface Guidelines.',
        'Designed and built Kotlin-based backend services to support mobile functionality.',
        'Collaborated with product and engineering teams to deliver reliable, scalable, production-ready releases.',
      ],
      link: 'https://github.com/paul9834',
    },
  ];

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private ngZone: NgZone,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.reducedMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.projects.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.setupIntersectionObserver();
        this.scheduleParallaxUpdate();
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    if (this.parallaxFrame) {
      cancelAnimationFrame(this.parallaxFrame);
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
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
      {
        threshold: 0.05,
        rootMargin: '80px 0px -8% 0px',
      },
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

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.resizeTimeout = setTimeout(() => this.scheduleParallaxUpdate(), 80);
  }

  private scheduleParallaxUpdate(): void {
    if (this.reducedMotion) return;
    if (this.parallaxFrame) return;

    this.ngZone.runOutsideAngular(() => {
      this.parallaxFrame = requestAnimationFrame(() => {
        this.updateParallax();
        this.parallaxFrame = undefined;
      });
    });
  }

  private updateParallax(): void {
    const wrappers = document.querySelectorAll<HTMLElement>('.parallax-wrapper');
    const isMobile = window.innerWidth <= 768;
    const isDesktopFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const viewH = window.innerHeight;

    wrappers.forEach((wrapper) => {
      const img = wrapper.querySelector<HTMLElement>('.parallax-image');
      if (!img) return;

      if (isDesktopFinePointer) {
        img.style.setProperty('--parallax-y', '0px');
        return;
      }

      const rect = wrapper.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > viewH) {
        img.style.setProperty('--parallax-y', '0px');
        return;
      }

      const progress = (viewH - rect.top) / (viewH + rect.height);
      const intensity = isMobile ? 4 : 6;
      const offset = (progress - 0.5) * intensity;

      img.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    });
  }
}
