import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_ENDPOINTS } from 'src/app/_shared/constants';
import {
  AccountLoginByTokenReq,
  AccountLoginReq,
  AccountLoginRes,
  ListServerRes
} from 'src/app/_shared/models/account';
import { BaseModel, BasePageModel, BaseModelResponse } from 'src/app/_shared/models/base';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AccountHttpService {
  private http = inject(HttpClient);

  login(request: AccountLoginReq) {
    return this.http.post<BaseModel<AccountLoginRes>>(
      API_ENDPOINTS.account.login,
      request
    );
  }

  loginByToken(request: AccountLoginByTokenReq) {
    return this.http.post<BaseModel<AccountLoginRes>>(
      API_ENDPOINTS.account.loginByToken,
      request
    );
  }
  getListServer() {
    return this.http.get<BaseModel<ListServerRes>>(
      API_ENDPOINTS.account.getListServer,
    );
  }
}
