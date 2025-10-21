import { Injectable, inject } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest,
  HttpErrorResponse, HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, take } from 'rxjs/operators';
import { HotToastService } from '@ngneat/hot-toast';
import { TranslateService } from '@ngx-translate/core';

import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConsoleLogService } from '../services/app';

@Injectable({ providedIn: 'root' })
export class ErrorInterceptor implements HttpInterceptor {
  private toast = inject(HotToastService);
  private translateService = inject(TranslateService);
  private auth = inject(AuthService);
  private consoleLog = inject(ConsoleLogService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      // SUCCESS responses (200/201/204…)
      tap(evt => {
        if (evt instanceof HttpResponse) {
          this.handleBody(evt, req);
        }
      }),
      // ERROR responses (4xx/5xx)
      catchError(err => this.handleHttpError(err))
    );
  }

  /** Handle SUCCESS body messages (optional server Message/message field) */
  private handleBody(event: HttpResponse<any>, request: HttpRequest<any>): void {
    const urlPath = (() => {
      try { return new URL(event.url ?? '', window.location.origin).pathname; }
      catch { return ''; }
    })();

    const body = event.body; // có thể null với 204
    this.consoleLog.debug?.default(body, `interceptor -> body -> api: ${urlPath}`);

    if (!body || typeof body !== 'object') return;

    const msgKey: string | undefined = (body as any).Message ?? (body as any).message;
    if (!msgKey) return;

    this.translateService.get(msgKey).pipe(take(1)).subscribe(localized => {
      switch (msgKey) {
        case 'DB_SystemError':
          this.toast.error('System error.');
          break;
        case 'DB_InvalidSender':
        case 'DB_InvalidReceiver':
          this.toast.error('User is invalid.');
          break;
        case 'TokenOffline':
          this.toast.error(localized || 'Token offline');
          break;
        case 'TokenNotExists':
          this.auth.logout();
          break;
        default:
          this.toast.error(localized || msgKey);
      }
    });
  }

  /** Handle ERROR responses robustly */
  private handleHttpError(error: any): Observable<never> {
    if (!(error instanceof HttpErrorResponse)) {
      // Non-HTTP error
      this.consoleLog.debug?.error(error, 'interceptor -> non-http-error');
      return throwError(() => error instanceof Error ? error : new Error('Unexpected error'));
    }

    this.consoleLog.debug?.error(error, 'interceptor -> http-error');

    // Normalize possible payload shapes
    let payload: any = error.error;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch { /* keep string */ }
    } else if (payload instanceof ArrayBuffer) {
      try { payload = JSON.parse(new TextDecoder().decode(payload)); } catch { /* ignore */ }
    } else if (payload instanceof Blob) {
      // không đọc Blob đồng bộ ở đây
      payload = undefined;
    }

    const message =
      payload?.message ??
      payload?.Message ??
      (error.status === 0 ? 'Network error' :
       error.statusText ? `HTTP ${error.status} ${error.statusText}` :
       'Unexpected error');

    this.toast.error(message);
    return throwError(() => new Error(message));
  }
}
