import { Directive, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appPortalToBody]',
  standalone: true,
})
export class PortalToBodyDirective implements AfterViewInit, OnDestroy {
  private placeholder: Comment | null = null;
  private moved = false;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    if (!host.parentNode) return;

    // tạo placeholder để biết vị trí cũ (nếu muốn quay về sau này)
    this.placeholder = document.createComment('portal-to-body-placeholder');
    host.parentNode.insertBefore(this.placeholder, host);

    // chuyển modal ra body
    document.body.appendChild(host);
    this.moved = true;
  }

  ngOnDestroy(): void {
    const host = this.el.nativeElement;

    if (this.moved && document.body.contains(host)) {
      document.body.removeChild(host);
    }

    // nếu cần trả lại vị trí cũ (trường hợp bạn dùng *ngIf thì không cần)
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.insertBefore(host, this.placeholder);
      this.placeholder.remove();
      this.placeholder = null;
    }
  }
}
