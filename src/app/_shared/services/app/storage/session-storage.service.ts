import { Injectable } from '@angular/core';

import { STORAGE_KEY } from 'src/app/_shared/constants';
import { StorageKeyKeys, StorageKeyValues } from './storage-key.type';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  getItemStorageKey<T>(key: StorageKeyKeys, isJSON = true): T | null {
    return this.getItem<T>(this.getKey(key), isJSON);
  }

  getItem<T>(key: string, isJSON = true): T | null {
    try {
      const lsValue = sessionStorage.getItem(key);
      if (!lsValue) {
        return null;
      }

      if (isJSON) {
        const data = JSON.parse(lsValue) as T;
        return data;
      } else {
        return lsValue as T;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  setItemStorageKey(key: StorageKeyKeys, value: any): void {
    sessionStorage.setItem(this.getKey(key), value);
  }

  setItem(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  removeItemStorageKey(key: StorageKeyKeys): void {
    sessionStorage.removeItem(this.getKey(key));
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  clear(): void {
    sessionStorage.clear();
  }

  private getKey(key: StorageKeyKeys): StorageKeyValues {
    return STORAGE_KEY[key];
  }
}
