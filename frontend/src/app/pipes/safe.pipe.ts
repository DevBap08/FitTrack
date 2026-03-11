import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
    name: 'safe',
    standalone: true
})
export class SafePipe implements PipeTransform {
    private sanitizer = inject(DomSanitizer);

    transform(url: string | null | undefined): SafeResourceUrl {
        if (!url) return this.sanitizer.bypassSecurityTrustResourceUrl('');
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
