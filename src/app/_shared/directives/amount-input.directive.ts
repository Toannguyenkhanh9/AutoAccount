import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: 'input[appAmount]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AmountInputDirective),
      multi: true,
    },
  ],
})
export class AmountInputDirective implements ControlValueAccessor {
  @Input() decimals = 2;
  @Input() allowNegative = true;
  @Input() locale = 'en-US';
  @Input() useGrouping = true;

  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};
  private focused = false;
  private groupSep = ',';
  private decSep = '.';
  private value: number | null = null;

  constructor(private el: ElementRef<HTMLInputElement>, private r: Renderer2) {
    // ép kiểu text để nhận giá trị có dấu phẩy ngăn cách
    this.r.setAttribute(this.el.nativeElement, 'type', 'text');
    // dọn các thuộc tính số nếu có
    this.r.removeAttribute(this.el.nativeElement, 'min');
    this.r.removeAttribute(this.el.nativeElement, 'max');
    this.r.removeAttribute(this.el.nativeElement, 'step');
    // lấy ký tự ngăn cách theo locale
    try {
      const parts = new Intl.NumberFormat(this.locale).formatToParts(12345.6);
      this.groupSep = parts.find((p) => p.type === 'group')?.value || ',';
      this.decSep = parts.find((p) => p.type === 'decimal')?.value || '.';
    } catch {}
    this.r.setAttribute(this.el.nativeElement, 'inputmode', 'decimal');
    this.r.setStyle(this.el.nativeElement, 'textAlign', 'right');
  }

  writeValue(val: number | null): void {
    this.value = val ?? null;
    this.el.nativeElement.value = this.focused
      ? this.formatRaw(this.value)
      : this.formatView(this.value);
  }
  registerOnChange(fn: any) {
    this.onChange = fn;
  }
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.r.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }

  @HostListener('focus') onFocus() {
    this.focused = true;
    this.el.nativeElement.value = this.formatRaw(this.value);
    setTimeout(() => this.el.nativeElement.select(), 0);
  }
  @HostListener('blur') onBlur() {
    this.focused = false;
    this.onTouched();
    this.el.nativeElement.value = this.formatView(this.value);
  }
  @HostListener('wheel', ['$event']) onWheel(ev: WheelEvent) {
    ev.preventDefault();
  }

  @HostListener('input') onInput() {
    const raw = this.el.nativeElement.value;
    const parsed = this.parse(raw);
    this.value = parsed;
    this.onChange(parsed);
    // giữ dạng raw khi đang focus để caret không nhảy
  }

  private parse(text: string): number | null {
    if (!text) return null;
    let s = text
      .replace(new RegExp('\\' + this.groupSep, 'g'), '')
      .replace(new RegExp('\\' + this.decSep, 'g'), '.')
      .replace(/[^\d\.\-]/g, '');
    const neg = this.allowNegative && s.startsWith('-');
    s = (neg ? '-' : '') + s.replace(/-/g, '').replace(/\.(?=.*\.)/g, '');
    if (s === '-' || s === '.' || s === '-.') return null;

    let n = Number(s);
    if (!isFinite(n)) return null;
    if (!this.allowNegative && n < 0) n = Math.abs(n);
    const f = Math.pow(10, this.decimals);
    n = Math.round(n * f) / f; // giới hạn số lẻ
    return n;
  }

  private formatView(val: number | null): string {
    if (val === null || val === undefined || isNaN(val as any)) return '';
    return new Intl.NumberFormat(this.locale, {
      useGrouping: this.useGrouping,
      minimumFractionDigits: this.decimals,
      maximumFractionDigits: this.decimals,
    }).format(val);
  }
  private formatRaw(val: number | null): string {
    if (val === null || val === undefined || isNaN(val as any)) return '';
    return val.toFixed(this.decimals);
  }
}
