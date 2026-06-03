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
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '../../../core/services/auth.service';
import {
  CreateNewsRequest,
  NewsArticle,
  NewsService,
  UpdateNewsRequest,
} from '../../../core/services/news.service';

@Component({
  selector: 'app-admin-news',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, RouterModule],
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminNewsComponent implements OnInit, OnDestroy {
  private readonly newsService = inject(NewsService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
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
    'DIV',
  ]);
  private readonly allowedSizeClasses = new Set(['editor-size-sm', 'editor-size-md', 'editor-size-lg']);
  private readonly allowedAlignClasses = new Set(['editor-align-left', 'editor-align-center', 'editor-align-justify']);

  ngOnInit(): void {
    this.loadArticles();
  }

  ngOnDestroy(): void {
    this.revokeImagePreviewUrl();
  }

  logout(): void {
    if (this.isEditorOpen() || this.isSubmitting()) {
      return;
    }

    this.authService.logout();
    void this.router.navigate(['/admin/login']);
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

    if (this.isBrowser) {
      setTimeout(() => {
        this.setEditorHtml('');
      });
    }
  }

  openEditEditor(article: NewsArticle): void {
    this.selectedArticle.set(article);
    this.submitError.set('');
    this.selectedImageFile.set(null);
    this.selectedImageName.set('');
    this.currentImageUrl.set(article.imageUrl?.trim() ? article.imageUrl : null);
    this.revokeImagePreviewUrl();

    const sanitizedContent = this.sanitizeEditorHtml(article.content ?? '');

    this.newsForm.reset({
      title: article.title,
      slug: article.slug,
      description: article.description,
      content: sanitizedContent,
      category: article.category,
    });

    this.isEditorOpen.set(true);

    if (this.isBrowser) {
      setTimeout(() => {
        this.setEditorHtml(sanitizedContent);
      });
    }
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

  onEditorKeydown(event: KeyboardEvent): void {
    if (!this.isBrowser || event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    const editor = this.contentEditor?.nativeElement;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    event.preventDefault();
    this.focusEditor();

    const paragraph = document.createElement('p');
    paragraph.appendChild(document.createElement('br'));

    range.deleteContents();
    range.insertNode(paragraph);

    const newRange = document.createRange();
    newRange.setStart(paragraph, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    this.captureEditorState();
  }

  onEditorBlur(): void {
    this.contentControl.markAsTouched();
    this.captureEditorState();
  }

  applyEditorCommand(command: 'bold' | 'italic' | 'underline' | 'insertUnorderedList' | 'insertOrderedList'): void {
    if (!this.isBrowser) {
      return;
    }

    const editor = this.contentEditor?.nativeElement;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    this.focusEditor();

    switch (command) {
      case 'bold':
        this.wrapSelectionWithTag('strong');
        break;
      case 'italic':
        this.wrapSelectionWithTag('em');
        break;
      case 'underline':
        this.wrapSelectionWithTag('u');
        break;
      case 'insertUnorderedList':
        this.wrapSelectionInList('ul');
        break;
      case 'insertOrderedList':
        this.wrapSelectionInList('ol');
        break;
    }

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

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    const fontSize = size === 'sm' ? '0.84rem' : size === 'lg' ? '1.16rem' : '0.98rem';
    const wrapper = document.createElement('span');
    wrapper.className = `editor-size-${size}`;
    wrapper.style.fontSize = fontSize;

    if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
      const textNode = range.startContainer;
      const text = textNode.textContent ?? '';
      const start = range.startOffset;
      const end = range.endOffset;
      const before = text.slice(0, start);
      const selected = text.slice(start, end);
      const after = text.slice(end);
      const parent = textNode.parentNode;

      if (!parent || !selected) {
        return;
      }

      if (before) {
        parent.insertBefore(document.createTextNode(before), textNode);
      }

      wrapper.textContent = selected;
      parent.insertBefore(wrapper, textNode);

      if (after) {
        parent.insertBefore(document.createTextNode(after), textNode);
      }

      parent.removeChild(textNode);
    } else {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);
    }

    selection.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    selection.addRange(newRange);

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

    this.wrapSelectionInBlock(tagName);
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

    this.wrapSelectionWithLink(url.trim());
    this.captureEditorState();
  }

  clearEditorFormatting(): void {
    if (!this.isBrowser) {
      return;
    }

    this.unwrapSelectionFormatting();
    this.captureEditorState();
  }

  private wrapSelectionWithTag(tagName: 'strong' | 'em' | 'u'): void {
    const selection = this.getEditorSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (selection.isCollapsed) {
      return;
    }

    const wrapper = document.createElement(tagName);
    const fragment = range.extractContents();
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  }

  private wrapSelectionInList(tagName: 'ul' | 'ol'): void {
    const selection = this.getEditorSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const list = document.createElement(tagName);
    const item = document.createElement('li');
    item.appendChild(range.extractContents());

    if (!item.textContent?.trim()) {
      return;
    }

    list.appendChild(item);
    range.insertNode(list);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(item);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  }

  private wrapSelectionInBlock(tagName: 'h2' | 'h3' | 'blockquote'): void {
    const selection = this.getEditorSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    const block = document.createElement(tagName);

    if (selection.isCollapsed) {
      block.appendChild(document.createElement('br'));
      range.insertNode(block);
    } else {
      block.appendChild(range.extractContents());
      range.insertNode(block);
    }

    const nextRange = document.createRange();
    nextRange.selectNodeContents(block);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  }

  private wrapSelectionWithLink(url: string): void {
    const selection = this.getEditorSelection();
    if (!selection || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.appendChild(range.extractContents());
    range.insertNode(link);

    const nextRange = document.createRange();
    nextRange.selectNodeContents(link);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  }

  private unwrapSelectionFormatting(): void {
    const selection = this.getEditorSelection();
    if (!selection) {
      return;
    }

    const editor = this.contentEditor?.nativeElement;
    if (!editor) {
      return;
    }

    const tagsToUnwrap = new Set(['STRONG', 'EM', 'U', 'A']);
    let current: HTMLElement | null = selection.anchorNode?.nodeType === Node.ELEMENT_NODE
      ? (selection.anchorNode as HTMLElement)
      : selection.anchorNode?.parentElement ?? null;

    while (current && current !== editor) {
      const parent = current.parentNode;
      if (tagsToUnwrap.has(current.tagName) && parent) {
        while (current.firstChild) {
          parent.insertBefore(current.firstChild, current);
        }
        parent.removeChild(current);
      }
      current = parent instanceof HTMLElement ? parent : null;
    }
  }

  private getEditorSelection(): Selection | null {
    if (!this.isBrowser) {
      return null;
    }

    const editor = this.contentEditor?.nativeElement;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return null;
    }

    this.focusEditor();
    return selection;
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

    if (!selection || selection.isCollapsed || !anchorNode || !editor) {
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

  private toggleBlockAlignment(alignmentClass: 'editor-align-left' | 'editor-align-center' | 'editor-align-justify'): void {
    if (!this.isBrowser) {
      return;
    }

    const editor = this.contentEditor?.nativeElement;
    if (!editor) {
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }

    const selectedText = range.toString().trim();
    if (!selectedText) {
      return;
    }

    const wrapper = document.createElement('span');
    wrapper.className = alignmentClass;
    wrapper.style.display = 'block';
    wrapper.style.textAlign = alignmentClass === 'editor-align-center'
      ? 'center'
      : alignmentClass === 'editor-align-justify'
        ? 'justify'
        : 'left';

    const fragment = range.extractContents();
    wrapper.appendChild(fragment);
    range.insertNode(wrapper);

    const caretRange = document.createRange();
    caretRange.setStartAfter(wrapper);
    caretRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(caretRange);

    this.captureEditorState();
  }

  renderFormattedContent(content: string | null | undefined): SafeHtml {
    const sanitized = this.sanitizeEditorHtml(content ?? '');
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  private setEditorHtml(rawHtml: string | null | undefined): void {
    const editor = this.contentEditor?.nativeElement;
    if (!editor) {
      return;
    }

    const nextHtml = this.sanitizeEditorHtml(rawHtml ?? '');
    if (editor.innerHTML !== nextHtml) {
      editor.innerHTML = nextHtml;
    }
  }

  private focusEditor(): void {
    this.contentEditor?.nativeElement.focus();
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

    const preservePlainTextLineBreaks = (): void => {
      const blocks = Array.from(doc.body.querySelectorAll('span, p, div, blockquote, li, h2, h3'));

      blocks.forEach((element) => {
        if (Array.from(element.children).some((child) => child.tagName === 'BR')) {
          return;
        }

        const text = element.textContent ?? '';
        if (!text.includes('\n')) {
          return;
        }

        const normalizedText = text.replace(/\r\n?/g, '\n');
        const fragments = normalizedText.split('\n');
        const fragment = doc.createDocumentFragment();

        fragments.forEach((part, index) => {
          if (part.length > 0) {
            fragment.appendChild(doc.createTextNode(part));
          }

          if (index < fragments.length - 1) {
            fragment.appendChild(doc.createElement('br'));
          }
        });

        element.replaceChildren(fragment);
      });
    };

    preservePlainTextLineBreaks();

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
            sanitizeNode(fragment);
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
        } else if (child.nodeType === Node.TEXT_NODE) {
          const textValue = child.textContent ?? '';

          if (!textValue.trim()) {
            continue;
          }

          const parent = child.parentNode;
          if (parent === doc.body) {
            const paragraph = doc.createElement('p');
            const normalizedText = textValue.replace(/\r\n?/g, '\n');
            const fragments = normalizedText.split('\n');

            fragments.forEach((part, index) => {
              if (part.trim()) {
                paragraph.appendChild(doc.createTextNode(part.trim()));
              }

              if (index < fragments.length - 1) {
                paragraph.appendChild(doc.createElement('br'));
              }
            });

            child.replaceWith(paragraph);
          }
        } else if (child.nodeType === Node.COMMENT_NODE) {
          child.remove();
        }
      }
    };

    sanitizeNode(doc.body);

    doc.body.querySelectorAll('p, h2, h3, blockquote, li').forEach((element) => {
      const html = element.innerHTML
        .replace(/(?:<br\s*\/?>\s*){3,}/gi, '<br><br>')
        .trim();

      if (html) {
        element.innerHTML = html;
      }
    });

    return doc.body.innerHTML
      .replace(/<div\b([^>]*)>/gi, '<p$1>')
      .replace(/<\/div>/gi, '</p>')
      .replace(/<span\b([^>]*)>([\s\S]*?)<\/span>/gi, (_match, attrs, inner) => {
        if (!inner.includes('<br')) {
          return `<span${attrs}>${inner}</span>`;
        }

        return inner
          .split(/<br\s*\/?>\s*<br\s*\/?>/gi)
          .map((chunk: string) => `<p${attrs}>${chunk.trim() || '<br>'}</p>`)
          .join('');
      })
      .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '<p><br></p>')
      .replace(/(<p><br><\/p>\s*){3,}/gi, '<p><br></p><p><br></p>')
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
