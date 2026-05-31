import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, Meta, SafeResourceUrl, Title } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-cv',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './cv.component.html',
  styleUrl: './cv.component.scss',
})
export class CvComponent implements OnInit {
  private readonly titleService = inject(Title);
  private readonly meta = inject(Meta);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly canonicalUrl = 'https://paul9834.com/cv';

  readonly cvPdfPath = 'assets/cv/CV_Kevin_Montealegre_En.pdf';
  readonly cvPdfPreviewUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.cvPdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.cvPdfPath);
  }

  ngOnInit(): void {
    const pageTitle = 'Kevin Paul Montealegre Melo CV | Senior Mobile Engineer Resume';
    const description =
      'Resume and CV of Kevin Paul Montealegre Melo, Senior Mobile Engineer based in Bogotá, Colombia, with experience in Android, iOS, Kotlin, Swift, fintech, enterprise apps, scalable architectures and high-impact mobile products.';

    this.titleService.setTitle(pageTitle);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'keywords', content: 'Kevin Paul Montealegre Melo CV, Kevin Montealegre resume, Senior Mobile Engineer resume, Android engineer CV, iOS engineer resume, Kotlin developer CV, Swift engineer resume, fintech mobile engineer' });

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
    this.setStructuredData();
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

  private setStructuredData(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const existing = document.getElementById('cv-structured-data');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'cv-structured-data';
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Kevin Paul Montealegre Melo',
      url: 'https://paul9834.com/cv',
      image: 'https://i.imgur.com/v3Gxdlp.jpeg',
      jobTitle: 'Senior Mobile Engineer',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bogotá',
        addressCountry: 'Colombia'
      },
      knowsAbout: ['Android', 'iOS', 'Kotlin', 'Swift', 'Jetpack Compose', 'SwiftUI', 'Spring Boot', 'Clean Architecture', 'Fintech'],
      sameAs: [
        'https://github.com/paul9834',
        'https://linkedin.com/in/paul9834'
      ]
    });

    document.head.appendChild(script);
  }
}
