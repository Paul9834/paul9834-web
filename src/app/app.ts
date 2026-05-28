import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router'; // <-- 1. Importa RouterOutlet

@Component({
  selector: 'app-root',
  standalone: true,
  // 2. Quitamos Hero y Projects. Agregamos RouterOutlet
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(private meta: Meta, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Paul Montealegre | Senior Mobile Engineer');

    this.meta.addTags([
      { name: 'description', content: 'Senior Mobile Engineer specialized in Kotlin, Swift and Clean Architecture. Systems Engineer based in Bogotá.' },
      { name: 'keywords', content: 'Mobile Engineer, Android Developer, iOS Developer, Kotlin Multiplatform, Jetpack Compose, Swift, Spring Boot, Bogotá' },
      { name: 'author', content: 'Kevin Montealegre' },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: 'Kevin Montealegre | Senior Mobile Engineer' },
      { property: 'og:description', content: 'Explore my portfolio as a Systems Engineer focusing on high-performance mobile development.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://paul9834.com' },
      { property: 'og:image', content: 'https://paul9834.com/assets/og-image.jpg' }
    ]);
  }
}
