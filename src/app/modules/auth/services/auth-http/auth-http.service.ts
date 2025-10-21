import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { API_ENDPOINTS } from 'src/app/_shared/constants';
import { BaseModel, BasePageModel } from 'src/app/_shared/models/base';
import {
  AccountLoginByTokenReq,
  AccountLoginReq,
  AccountLoginRes,
  ListServerRes,
  ConfirmCodeResponse,
} from 'src/app/_shared/models/account';

@Injectable({
  providedIn: 'root',
})
export class AuthHttpService {
  private http = inject(HttpClient);

  login(request: AccountLoginReq): Observable<BaseModel<AccountLoginRes>> {
    return this.http.post<BaseModel<AccountLoginRes>>(
      `${API_ENDPOINTS.account.login}`,
      {
        ...request,
      }
    );
  }

  loginByToken(
    request: AccountLoginByTokenReq
  ): Observable<BaseModel<AccountLoginRes>> {
    return this.http.post<BaseModel<AccountLoginRes>>(
      `${API_ENDPOINTS.account.loginByToken}`,
      {
        ...request,
      }
    );
  }
  getListServer(): Observable<ListServerRes> {
    return this.http.get<ListServerRes>(
      `${API_ENDPOINTS.account.getListServer}`,
      {}
    );
  }
  confirmCode(code: string): Observable<ConfirmCodeResponse> {
    return this.http.post<ConfirmCodeResponse>(
      `${API_ENDPOINTS.account.confirmCode}`,
      {
        code,
      }
    );
  }
}
