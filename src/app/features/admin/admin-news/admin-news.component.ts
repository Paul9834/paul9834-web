import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';

import {
  CreateNewsRequest,
  NewsArticle,
  NewsService,
  UpdateNewsRequest,
} from '../../../core/services/news.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit, OnDestroy {
  private readonly newsService = inject(NewsService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly articles = signal<NewsArticle[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');

  readonly isEditorOpen = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitError = signal('');
  readonly selectedArticle = signal<NewsArticle | null>(null);

  readonly selectedImageFile = signal<File | null>(null);
  readonly selectedImageName = signal('');
  readonly currentImageUrl = signal<string | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);

  @ViewChild('contentEditor') private contentEditor?: ElementRef<HTMLDivElement>;

  readonly newsForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    slug: ['', [Validators.required, Validators.maxLength(180)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
    content: ['', [Validators.required]],
    category: ['', [Validators.required, Validators.maxLength(80)]],
  });

  private readonly urlRegex = /(https?:\/\/[^\s]+)/g;
  private readonly allowedTags = new Set([
    'P',
    'BR',
    'STRONG',
    'B',
    'EM',
    'I',
    'U',
    'A',
    'H2',
    'H3',
    'UL',
    'OL',
    'LI',
    'BLOCKQUOTE',
    'SPAN',
  ]);
  private readonly allowedSizeClasses = new Set(['editor-size-sm', 'editor-size-md', 'editor-size-lg']);
  private readonly allowedAlignClasses = new Set(['editor-align-left', 'editor-align-center', 'editor-align-justify']);

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.revokeImagePreviewUrl();
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.newsService.getAdminNews(0, 20).subscribe({
      next: (response) => {
        const sorted = [...response.articles].sort((a, b) => {
          if (a.published !== b.published) {
            return a.published ? 1 : -1;
          }

          const leftDate = a.published
            ? this.normalizeSortableDate(a.publishedAt)
            : this.normalizeSortableDate(a.createdAt);
          const rightDate = b.published
            ? this.normalizeSortableDate(b.publishedAt)
            : this.normalizeSortableDate(b.createdAt);

          return rightDate.localeCompare(leftDate);
        });

        this.articles.set(sorted);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading admin news:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Tu sesión no es válida o no tienes permisos para consultar noticias.',
          );
        } else if (error.status === 0) {
          this.errorMessage.set('No fue posible conectar con el backend.');
        } else {
          this.errorMessage.set('No se pudieron cargar las noticias del panel admin.');
        }

        this.isLoading.set(false);
      },
    });
  }

  openCreateEditor(): void {
    this.selectedArticle.set(null);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(null);
    this.revokeImagePreviewUrl();

    this.newsForm.reset({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
    });

    this.isEditorOpen.set(true);
    this.syncEditorFromForm();
  }

  openEditEditor(article: NewsArticle): void {
    this.selectedArticle.set(article);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(article.imageUrl?.trim() ? article.imageUrl : null);
    this.revokeImagePreviewUrl();

    this.newsForm.reset({
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: article.content,
      category: article.category,
    });

    this.isEditorOpen.set(true);
    this.syncEditorFromForm();
  }

  closeEditor(): void {
    this.isEditorOpen.set(false);
    this.selectedArticle.set(null);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(null);
    this.revokeImagePreviewUrl();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedImageFile.set(file);
    this.selectedImageName.set(file?.name ?? '');
    this.revokeImagePreviewUrl();

    if (file && this.isBrowser) {
      const previewUrl = URL.createObjectURL(file);
      this.imagePreviewUrl.set(previewUrl);
    }
  }

  publishArticle(article: NewsArticle): void {
    if (article.published) {
      return;
    }

    this.errorMessage.set('');
    this.submitError.set('');

    this.newsService.publishNews(article.slug).subscribe({
      next: () => {
        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error publishing news:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Tu sesión no es válida o no tienes permisos para publicar noticias.',
          );
        } else {
          this.errorMessage.set('No se pudo publicar la noticia.');
        }
      },
    });
  }

  formatPublishedAt(value: string | null): string {
    if (!value?.trim()) {
      return 'Aún no publicado';
    }

    const date = new Date(this.normalizeSortableDate(value));

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  formatCreatedAt(value: string | null): string {
    if (!value?.trim()) {
      return 'Fecha no disponible';
    }

    const date = new Date(this.normalizeSortableDate(value));

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(date);
  }

  private normalizeSortableDate(value: string | null): string {
    const trimmed = value?.trim();

    if (!trimmed) {
      return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return `${trimmed}T12:00:00`;
    }

    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.replace(' ', 'T').replace(/\.\d+$/, '');
    }

    return trimmed;
  }

  deleteArticle(article: NewsArticle): void {
    if (!this.isBrowser) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres eliminar la noticia "${article.title}"?`);

    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.submitError.set('');

    this.newsService.deleteNews(article.slug).subscribe({
      next: () => {
        if (this.selectedArticle()?.slug === article.slug) {
          this.closeEditor();
        }

        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting news:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage.set(
            'Tu sesión no es válida o no tienes permisos para eliminar noticias.',
          );
        } else {
          this.errorMessage.set('No se pudo eliminar la noticia.');
        }
      },
    });
  }

  get contentControl() {
    return this.newsForm.controls.content;
  }

  onEditorInput(rawHtml: string): void {
    const sanitized = this.sanitizeEditorHtml(rawHtml);
    this.contentControl.setValue(sanitized);
    this.contentControl.markAsDirty();
  }

  onEditorBlur(): void {
    this.contentControl.markAsTouched();
    this.syncEditorFromForm();
  }

  applyEditorCommand(command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList'): void {
    if (!this.isBrowser) {
      return;
    }

    this.focusEditor();
    document.execCommand(command);
    this.captureEditorState();
  }

  applyTextSize(size: 'sm' | 'md' | 'lg'): void {
    if (!this.isBrowser) {
      return;
    }

    const editor = this.contentEditor?.nativeElement;
    if (!editor) {
      return;
    }

    this.focusEditor();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const fontSize = size === 'sm' ? '0.84rem' : size === 'lg' ? '1.16rem' : '0.98rem';

    document.execCommand('styleWithCSS', false, 'true');
    document.execCommand('fontSize', false, '3');

    const spans = editor.querySelectorAll('font[size="3"], span[style*="font-size"]');
    spans.forEach((span) => {
      const s = span as HTMLElement;
      if (s.tagName === 'FONT') {
        s.removeAttribute('size');
        s.style.fontSize = fontSize;
      } else if (s.tagName === 'SPAN') {
        s.style.fontSize = fontSize;
      }
    });

    this.captureEditorState();
  }

  toggleJustifyText(): void {
    this.toggleBlockAlignment('editor-align-justify');
  }

  toggleCenterText(): void {
    this.toggleBlockAlignment('editor-align-center');
  }

  clearTextAlignment(): void {
    this.toggleBlockAlignment('editor-align-left');
  }

  isSelectionUsingSize(size: 'sm' | 'md' | 'lg'): boolean {
    return this.isSelectionInsideClass(`editor-size-${size}`);
  }

  isSelectionJustified(): boolean {
    return this.isSelectionInsideClass('editor-align-justify');
  }

  isSelectionCentered(): boolean {
    return this.isSelectionInsideClass('editor-align-center');
  }

  isSelectionLeftAligned(): boolean {
    return !this.isSelectionJustified() && !this.isSelectionCentered();
  }

  formatBlock(tagName: 'h2' | 'h3' | 'blockquote'): void {
    if (!this.isBrowser) {
      return;
    }

    this.focusEditor();
    document.execCommand('formatBlock', false, tagName);
    this.captureEditorState();
  }

  setEditorLink(): void {
    if (!this.isBrowser) {
      return;
    }

    const url = window.prompt('Pega la URL del enlace');
    if (!url) {
      return;
    }

    this.focusEditor();
    document.execCommand('createLink', false, url.trim());
    this.captureEditorState();
  }

  clearEditorFormatting(): void {
    if (!this.isBrowser) {
      return;
    }

    this.focusEditor();
    document.execCommand('removeFormat');
    document.execCommand('unlink');
    this.captureEditorState();
  }

  isSelectionInsideTag(tagName: string): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    const editor = this.contentEditor?.nativeElement;

    if (!anchorNode || !editor) {
      return false;
    }

    let current: HTMLElement | null = anchorNode.nodeType === Node.ELEMENT_NODE
      ? (anchorNode as HTMLElement)
      : anchorNode.parentElement;

    while (current && current !== editor) {
      if (current.tagName.toLowerCase() === tagName.toLowerCase()) {
        return true;
      }
      current = current.parentElement;
    }

    return false;
  }

  isSelectionInsideClass(className: string): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;
    const editor = this.contentEditor?.nativeElement;

    if (!anchorNode || !editor) {
      return false;
    }

    let current: HTMLElement | null = anchorNode.nodeType === Node.ELEMENT_NODE
      ? (anchorNode as HTMLElement)
      : anchorNode.parentElement;

    while (current && current !== editor) {
      if (current.classList.contains(className)) {
        return true;
      }
      current = current.parentElement;
    }

    return false;
  }

  private findClosestMatchingClass(node: Node | null, editor: HTMLElement, pattern: RegExp): HTMLElement | null {
    let current: HTMLElement | null = node?.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node?.parentElement ?? null;

    while (current && current !== editor) {
      if ([...current.classList].some((className) => pattern.test(className))) {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  private findClosestBlockElement(node: Node | null, editor: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = node?.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node?.parentElement ?? null;

    while (current && current !== editor) {
      if (['P', 'H2', 'H3', 'BLOCKQUOTE', 'LI'].includes(current.tagName)) {
        return current;
      }
      current = current.parentElement;
    }

    return editor;
  }

  private toggleBlockAlignment(alignmentClass: 'editor-align-left' | 'editor-align-center' | 'editor-align-justify'): void {
    if (!this.isBrowser) {
      return;
    }

    const editor = this.contentEditor?.nativeElement;
    if (!editor) {
      return;
    }

    this.focusEditor();

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const isCenter = alignmentClass === 'editor-align-center';
    const isJustify = alignmentClass === 'editor-align-justify';
    const textAlign = isCenter ? 'center' : isJustify ? 'justify' : '';

    const allBlocks = Array.from(editor.querySelectorAll('p, h2, h3, blockquote, li, div')) as HTMLElement[];
    const affectedBlocks = allBlocks.filter((block) => range.intersectsNode(block));

    if (affectedBlocks.length === 0) {
      const fallbackBlock = this.findClosestBlockElement(selection.anchorNode, editor);
      if (fallbackBlock) {
        fallbackBlock.style.textAlign = textAlign;
        this.updateBlockClass(fallbackBlock, alignmentClass);
      }
      this.captureEditorState();
      return;
    }

    affectedBlocks.forEach((block) => {
      block.style.textAlign = textAlign;
      this.updateBlockClass(block, alignmentClass);
    });

    this.captureEditorState();
  }

  renderFormattedContent(content: string | null | undefined): SafeHtml {
    const sanitized = this.sanitizeEditorHtml(content ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  private syncEditorFromForm(): void {
    if (!this.isBrowser) {
      return;
    }

    queueMicrotask(() => {
      const editor = this.contentEditor?.nativeElement;
      if (!editor) {
        return;
      }

      const nextHtml = this.sanitizeEditorHtml(this.contentControl.value);
      if (editor.innerHTML !== nextHtml) {
        editor.innerHTML = nextHtml;
      }
    });
  }

  private focusEditor(): void {
    this.contentEditor?.nativeElement.focus();
  }

  private updateBlockClass(block: HTMLElement, className: 'editor-align-left' | 'editor-align-center' | 'editor-align-justify'): void {
    block.classList.remove('editor-align-left', 'editor-align-center', 'editor-align-justify');

    if (className !== 'editor-align-left') {
      block.classList.add(className);
    }
  }

  private captureEditorState(): void {
    const editor = this.contentEditor?.nativeElement;
    if (!editor) {
      return;
    }

    const sanitized = this.sanitizeEditorHtml(editor.innerHTML);
    this.contentControl.setValue(sanitized);
    this.contentControl.markAsDirty();
  }

  private sanitizeEditorHtml(rawHtml: string): string {
    if (!this.isBrowser || !rawHtml?.trim()) {
      return '';
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');

    const sanitizeNode = (node: Node): void => {
      const children = Array.from(node.childNodes);

      for (const child of children) {
        if (child.nodeType === Node.ELEMENT_NODE) {
          const element = child as HTMLElement;

          if (!this.allowedTags.has(element.tagName)) {
            const fragment = doc.createDocumentFragment();
            while (element.firstChild) {
              fragment.appendChild(element.firstChild);
            }
            element.replaceWith(fragment);
            continue;
          }

          Array.from(element.attributes).forEach((attribute) => {
            const name = attribute.name.toLowerCase();
            const value = attribute.value.trim();

            if (element.tagName === 'A' && name === 'href' && /^https?:\/\//i.test(value)) {
              element.setAttribute('href', value);
              element.setAttribute('target', '_blank');
              element.setAttribute('rel', 'noopener noreferrer');
              return;
            }

            if (name === 'class') {
              const allClasses = value.split(/\s+/);
              const keptSizeClasses = allClasses.filter((className) => this.allowedSizeClasses.has(className));
              const keptAlignClasses = allClasses.filter((className) => this.allowedAlignClasses.has(className));
              const finalClasses = [...keptSizeClasses, ...keptAlignClasses];

              if (finalClasses.length > 0) {
                element.className = finalClasses.join(' ');
              } else {
                element.removeAttribute('class');
              }
              return;
            }

            if (name === 'style') {
              const safeStyle = value
                .split(';')
                .map((rule) => rule.trim())
                .filter(Boolean)
                .filter((rule) => /^font-size\s*:/i.test(rule) || /^text-align\s*:/i.test(rule))
                .join('; ');

              if (safeStyle) {
                element.setAttribute('style', safeStyle);
              } else {
                element.removeAttribute('style');
              }
              return;
            }

            element.removeAttribute(attribute.name);
          });

          sanitizeNode(element);
        } else if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
        }
      }
    };

    sanitizeNode(doc.body);

    return doc.body.innerHTML
      .replace(/<div>/gi, '<p>')
      .replace(/<\/div>/gi, '</p>')
      .trim();
  }

  linkifyContent(content: string): string {
    if (!content?.trim()) {
      return '';
    }

    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

    return escaped
      .replace(this.urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n/g, '<br>');
  }

  submitForm(): void {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      return;
    }

    const selected = this.selectedArticle();

    if (!selected && !this.selectedImageFile()) {
      this.submitError.set('Debes seleccionar una imagen para crear la noticia.');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    const raw = this.newsForm.getRawValue();

    if (selected) {
      const payload: UpdateNewsRequest = {
        title: raw.title,
        description: raw.description,
        content: raw.content,
        category: raw.category,
        imageUrl: this.currentImageUrl(),
      };

      this.newsService.updateNews(selected.slug, payload, this.selectedImageFile()).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.closeEditor();
          this.loadArticles();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating news:', error);
          this.submitError.set('No se pudo actualizar la noticia.');
          this.isSubmitting.set(false);
        },
      });

      return;
    }

    const payload: CreateNewsRequest = {
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      content: raw.content,
      category: raw.category,
    };


    this.newsService.createNews(payload, this.selectedImageFile()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.closeEditor();
        this.loadArticles();
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating news:', error.status, error.error, error);
        this.submitError.set(error.error?.error ?? 'No se pudo crear la noticia.');
        this.isSubmitting.set(false);
      },
    });
  }

  private revokeImagePreviewUrl(): void {
    const currentPreview = this.imagePreviewUrl();

    if (currentPreview && this.isBrowser) {
      URL.revokeObjectURL(currentPreview);
    }

    this.imagePreviewUrl.set(null);
  }
}
