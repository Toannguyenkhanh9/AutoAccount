import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
  standalone: true,
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchTerm: string, key: string): any[] {
    if (!searchTerm) return items;
    return items.filter(item => 
      item[key].toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}