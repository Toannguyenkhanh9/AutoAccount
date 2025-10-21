import { Injectable } from '@angular/core';

import { STORAGE_KEY } from 'src/app/_shared/constants';
import { StorageKeyKeys, StorageKeyValues } from './storage-key.type';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  getItemStorageKey<T = any>(
    key: StorageKeyKeys,
    isJSON = true
  ): T | undefined {
    return this.getItem<T>(this.getKey(key), isJSON);
  }

  getItem<T = any>(key: string, isJSON = true): T | undefined {
    try {
      const lsValue = localStorage.getItem(key);
      if (!lsValue) {
        return undefined;
      }

      if (isJSON) {
        const data = JSON.parse(lsValue) as T;
        return data;
      } else {
        return lsValue as T;
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  setItemStorageKey(key: StorageKeyKeys, value: any): void {
    localStorage.setItem(this.getKey(key), value);
  }

  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItemStorageKey(key: StorageKeyKeys): void {
    localStorage.removeItem(this.getKey(key));
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  clear(): void {
    localStorage.clear();
  }

  private getKey(key: StorageKeyKeys): StorageKeyValues {
    return STORAGE_KEY[key];
  }
}
