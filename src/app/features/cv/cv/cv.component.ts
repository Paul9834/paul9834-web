import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
export class CvComponent {
  readonly cvPdfPath = 'assets/cv/CV_Kevin_Montealegre_En.pdf';
  readonly cvPdfPreviewUrl: SafeResourceUrl;
  readonly stack = ['Android', 'Kotlin', 'Angular', 'Spring Boot', 'Arquitectura'];

  constructor(private sanitizer: DomSanitizer) {
    this.cvPdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.cvPdfPath);
  }
}
