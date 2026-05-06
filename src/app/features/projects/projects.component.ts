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
  private ticking = false;
  private isParallaxReset = false;

  projects: Project[] = [
    {
      title: 'GoPoli Institutional App',
      role: 'Android Developer',
      chronology: 'May 2019 - Sep 2020',
      startDate: new Date('2019-05-01'),
      description:
        'Institutional application for Politécnico Grancolombiano featuring campus services and SSO integration.',
      techStack: ['Java', 'Kotlin', 'OAuth2/OIDC', 'FCM', 'Material Design'],
      image: 'https://i.imgur.com/qUwtGbw.png',
      achievements: [
        'Led development and release, designing a clean, Material Design-compliant UI/UX.',
        'Integrated third-party APIs including SSO OAuth2/OIDC, academic systems, and FCM notifications.',
        'Carried out systematic testing, debugging, and performance optimisation for multi-version compatibility.',
      ],
      link: 'https://github.com/paul9834',
    },
    {
      title: 'Qinaya Remote Desktop',
      role: 'Android Developer',
      chronology: 'Oct 2020 - Jan 2022',
      startDate: new Date('2020-10-01'),
      description:
        'Android applications for remote desktop access with a strong focus on secure communication and network protocols.',
      techStack: ['Android SDK', 'Network Protocols', 'Security', 'Encryption'],
      image: 'https://i.imgur.com/m6Tyfa2.png',
      achievements: [
        'Ensured stable and secure communication through advanced user authentication.',
        'Applied encryption protocols to safeguard sensitive data during remote sessions.',
        'Implemented performance optimisations across devices and resolutions to deliver a smooth user experience.',
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
      title: 'Dinastía - Pet Management App',
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

    // Orden descendente: más reciente → más antiguo
    this.projects.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    this.setupIntersectionObserver();
    this.updateParallax();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
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
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    items.forEach((item) => this.observer?.observe(item));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser || this.ticking) return;

    this.ticking = true;

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.updateParallax();
        this.ticking = false;
      });
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!this.isBrowser || this.ticking) return;

    this.ticking = true;

    this.ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        this.updateParallax();
        this.ticking = false;
      });
    });
  }

  private updateParallax(): void {
    const wrappers = document.querySelectorAll<HTMLElement>('.parallax-wrapper');
    const isMobile = window.innerWidth <= 768;
    const viewH = window.innerHeight;

    wrappers.forEach((wrapper) => {
      const img = wrapper.querySelector<HTMLElement>('.parallax-image');
      if (!img) return;

      const rect = wrapper.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > viewH) return;

      const progress = (viewH - rect.top) / (viewH + rect.height);
      const intensity = isMobile ? 12 : 28;
      const offset = (progress - 0.5) * intensity;

      img.style.transform = `translateY(${offset}px)`;
    });
  }
}
