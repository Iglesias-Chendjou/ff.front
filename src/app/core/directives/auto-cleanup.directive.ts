import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';
import { ImageCleanupService } from '../services/image-cleanup.service';

@Directive({
  selector: 'img[ffAutoCleanup]',
  standalone: true,
})
export class AutoCleanupDirective implements OnInit {
  @Input() ffAutoCleanup = '';
  private el = inject<ElementRef<HTMLImageElement>>(ElementRef);
  private cleanup = inject(ImageCleanupService);

  async ngOnInit(): Promise<void> {
    const src = this.ffAutoCleanup || this.el.nativeElement.src;
    if (!src) return;

    const isWhite = await this.cleanup.hasWhiteBackground(src);
    if (isWhite) {
      this.el.nativeElement.src = src;
      return;
    }

    const cleanedUrl = await this.cleanup.removeBackground(src);
    this.el.nativeElement.src = cleanedUrl;
  }
}
