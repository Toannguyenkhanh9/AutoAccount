import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConsoleLogService {
  private colors = {
    default: '#6c757d',
    info: '#0275d8',
    success: '#5cb85c',
    warning: '#f0ad4e',
    error: '#d9534f',
  };

  get debug(): ConsoleLogService | undefined {
    if (environment.debug) {
      return this;
    }
    return undefined;
  }

  default(message: any, title?: string, ...optionalParams: any[]) {
    console.log(
      `%c ${title ?? 'INFO'} `,
      `padding: 2px 0; border-radius: 5px ; background: ${this.colors.default}; color: #fff `,
      message,
      ...optionalParams
    );
  }

  info(message: any, title?: string, ...optionalParams: any[]) {
    console.log(
      `%c ${title ?? 'INFO'} `,
      `padding: 2px 0; border-radius: 5px ; background: ${this.colors.info}; color: #fff `,
      message,
      ...optionalParams
    );
  }

  success(message: any, title?: string, ...optionalParams: any[]) {
    console.log(
      `%c ${title ?? 'SUCCESS'} `,
      `padding: 2px 0; border-radius: 5px ; background: ${this.colors.success}; color: #fff `,
      message,
      ...optionalParams
    );
  }

  warn(message: any, title?: string, ...optionalParams: any[]) {
    console.warn(
      `%c ${title ?? 'WARN'} `,
      `padding: 2px 0; border-radius: 5px ; background: ${this.colors.warning}; color: #fff `,
      message,
      ...optionalParams
    );
  }

  error(message: any, title?: string, ...optionalParams: any[]) {
    console.error(
      `%c ${title ?? 'ERROR'} `,
      `padding: 2px 0; border-radius: 5px ; background: ${this.colors.error}; color: #fff `,
      message,
      ...optionalParams
    );
  }
}
