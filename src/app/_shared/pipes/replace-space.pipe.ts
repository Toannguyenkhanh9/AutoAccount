import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'replaceSpace',
  standalone: true,
})
export class ReplaceSpacePipe implements PipeTransform {
  transform(value: string, replacement: string = '-'): string {
    return value ? value.replace(/\s+/g, replacement) : '';
  }
}