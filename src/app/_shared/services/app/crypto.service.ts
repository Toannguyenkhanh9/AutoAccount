import { Injectable, inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';

import { ConsoleLogService } from './console-log.service';

@Injectable({ providedIn: 'root' })
export class CryptoService {
  private consoleLogService = inject(ConsoleLogService);

  encryptData(data: any): string | undefined {
    try {
      return CryptoJS.AES.encrypt(
        JSON.stringify(data),
        environment.encryptSecretKey
      ).toString();
    } catch (e) {
      this.consoleLogService.error(e, 'cryptoService');
      return undefined;
    }
  }

  decryptData<T>(data: any): T | undefined {
    try {
      const bytes = CryptoJS.AES.decrypt(data, environment.encryptSecretKey);
      if (bytes.toString()) {
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8)) as T;
      } else {
        return undefined;
      }
    } catch (e) {
      this.consoleLogService.error(e, 'cryptoService');
      return undefined;
    }
  }
}
