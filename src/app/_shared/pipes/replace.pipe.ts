
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceAll',  standalone: true, })
export class ReplaceAllPipe implements PipeTransform {
  transform(value: string, search: string, replace: string): string {
    if (!value) return value;
    // escape search để dùng trong RegExp
    const esc = search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    return value.replace(new RegExp(esc, 'g'), replace);
  }
}
