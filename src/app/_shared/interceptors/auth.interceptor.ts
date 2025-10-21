import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpHeaders,
} from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ConsoleLogService } from '../services/app';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  constructor() {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const tokenRequest = req.clone({
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'x-key': environment.apiKey,
        Authorization: `Bearer ${this.authService.authFromLocalStorage?.UserInfo.SessionToken}`,
      }),
    });
    return next.handle(tokenRequest);
  }
}
