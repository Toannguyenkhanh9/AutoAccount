import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  chain(...fns: any[]) {
    console.log(fns);
    return (x: any) => fns.reduce((v, f) => f(v), x);
  }

  removeAccents(text: string) {
    if (!text) {
      return text;
    }

    // Normalize the string to NFD form (Normalization Form Decomposition)
    const normalizedStr = text.normalize('NFD');

    // Use a regular expression to remove accents
    const accentPattern = /[\u0300-\u036f]+/g;

    // Replace specific Vietnamese characters that are not covered by normalization
    const noAccents = normalizedStr
      .replace(accentPattern, '')
      .replace(/Đ/g, 'D') // Replace uppercase Đ
      .replace(/đ/g, 'd'); // Replace lowercase đ

    return noAccents;
  }

  removeSpecialCharacters(text: string) {
    if (!text) {
      return text;
    }

    return text.replace(/[^a-zA-Z0-9]/g, '');
  }

  removeAllExceptNumber(text: string) {
    if (!text) {
      return text;
    }

    return text.replace(/[^0-9]/g, '');
  }
}
