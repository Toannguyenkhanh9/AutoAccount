import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BehaviorSubject,
  Observable,
  Subscription,
  catchError,
  finalize,
  map,
  of,
  throwError,
  delay
} from 'rxjs';

import { UsersTable } from 'src/app/_fake/users.table';
import { ROUTER_KEYS } from 'src/app/_shared/constants';

import {
  ConsoleLogService,
  CryptoService,
  LocalStorageService,
  SessionStorageService,
} from 'src/app/_shared/services/app';
import { AuthHttpService } from './auth-http';
import {
  AccountLoginRes,
  Permission,
  UserInfo,
} from 'src/app/_shared/models/account';
import { AuthPermission } from 'src/app/_shared/models/app';


// const fakeUser = UsersTable.users[0];
// fakeUser.token = 'testToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authHttp = inject(AuthHttpService);
  private localStorageService = inject(LocalStorageService);
  private sessionStorageService = inject(SessionStorageService);
  private consoleLog = inject(ConsoleLogService);
  private cryptoService = inject(CryptoService);

  private _subscriptions: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private _currentUser$ = new BehaviorSubject<UserInfo | undefined>(undefined);
  private _userPermissions$ = new BehaviorSubject<
    Array<Permission> | undefined
  >(undefined);
  private _isLoading$ = new BehaviorSubject<boolean>(false);

  currentUser$ = this._currentUser$.asObservable();
  userPermission$ = this._userPermissions$.asObservable();
  isLoading$ = this._isLoading$.asObservable();

  /**
   * Get state snapshot
   */
  get snapshot() {
    return {
      user: this._currentUser$.value,
      permissions: this._userPermissions$.value,
    };
  }

  get authFromLocalStorage() {
    return this.getAuthFromLocalStorage();
  }

  constructor() {}

  FAKE_RESPONSE: AccountLoginRes = {
    UserInfo: {
      UserLevel: 10,
      SessionToken: 'fake-session-token-123',
      AccDateType: 'dd/MM/yyyy',
      CurCode: 'USD',
      UserName: 'demoUser',
      ConcreteUser: 'Demo User',
      IsShadow: false,
      IsMain: true,
      Language: 'en',
      MerchantId: 123,
      GameSystemID: 456,
      IsTransferAcc: false,
      IsAgentCash: false,
      IsAffiliate: false,
      MerchantName: 'Demo Merchant',
      Message: null,
      CasinoId: 789,
      IsFixCurrency: false,
    },
    Permissions: [
      {
        PrgCode: 'PRG001',
        AllowAddNew: true,
        AllowEdit: true,
        AllowRead: true,
        AllowDelete: false,
      },
      {
        PrgCode: 'PRG002',
        AllowAddNew: false,
        AllowEdit: true,
        AllowRead: true,
        AllowDelete: false,
      },
      // ... bạn có thể thêm permission khác nếu cần
    ],
  };
  loginFake(
    username: string,
    password: string
  ): Observable<AccountLoginRes | undefined> {
    this._isLoading$.next(true);

    const simulatedDelayMs = 500 + Math.floor(Math.random() * 300);

    const isValid = username === 'demo' && password === 'demo123';

    const source$ = isValid
      ? of(this.FAKE_RESPONSE)
      : throwError(() => new Error('Tên đăng nhập hoặc mật khẩu không đúng'));

    return source$.pipe(
      delay(simulatedDelayMs),
      map((res) => {
        this.consoleLog?.debug?.info?.(res, 'auth.service -> loginFake');

        this.setAuthFromLocalStorage(res);
        this._currentUser$.next(res.UserInfo);
        this._userPermissions$.next(res.Permissions);

        return res;
      }),
      catchError((err) => {
        this.consoleLog?.debug?.error?.(err, 'auth.service -> loginFake');
        return of(undefined);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }
  login(
    username: string,
    password: string
  ): Observable<AccountLoginRes | undefined> {
    // this.setAuthFromLocalStorage(fakeUser);
    // this._currentUser$.next(fakeUser);
    // console.log(fakeUser, this.snapshot);
    // return of(fakeUser);

    this._isLoading$.next(true);
    return this.authHttp
      .login({
        username,
        password,
        clientIp: '',
        siteName: new URL(window.location.href).hostname,
        sessionId: '',
        isSuperSite: true,
      })
      .pipe(
        map((res) => {
          this.consoleLog.debug?.info(res, 'auth.service -> login');
          if (!res.Message) {
            const user: AccountLoginRes = { ...res.Result };
            this.setAuthFromLocalStorage(user);
            this._currentUser$.next(user.UserInfo);
            this._userPermissions$.next(user.Permissions);
            return user;
          } else {
            throw new Error(res.Message);
          }
        }),
        catchError((err) => {
          this.consoleLog.debug?.error(err, 'auth.service -> login');
          return of(undefined);
        }),
        finalize(() => this._isLoading$.next(false))
      );
  }

  loginByToken(token: string): Observable<AccountLoginRes | undefined> {
    // fakeUser.token = token;
    // this.setAuthFromLocalStorage(fakeUser);
    // this._currentUser$.next(fakeUser);
    // return of(fakeUser);

    this._isLoading$.next(true);
    return this.authHttp.loginByToken({ token }).pipe(
      map((res) => {
        this.consoleLog.debug?.info(res, 'auth.service -> loginByToken');
        if (!res.Message) {
          const user = res.Result;
          user.UserInfo.SessionToken = token;
          this.setAuthFromLocalStorage(user);
          this._currentUser$.next(user.UserInfo);
          this._userPermissions$.next(user.Permissions);
          // this.notificationService.connect();
          return user;
        } else {
          throw new Error(res.Message);
        }
      }),
      catchError((err) => {
        this.consoleLog.debug?.error(err, 'auth.service -> loginByToken');
        return of(undefined);
      }),
      finalize(() => this._isLoading$.next(false))
    );
  }

  getUserByToken(): Observable<AccountLoginRes | undefined> {
    const url = new URL(window.location.href);
    const tokenParam = url.searchParams.get('loginToken');

    if (tokenParam) {
      return this.loginByToken(tokenParam);
    }

    const auth = this.getAuthFromLocalStorage();
    if (!auth || (auth && !auth.UserInfo.SessionToken)) {
      return of(undefined);
    }

    return this.loginByToken(auth.UserInfo.SessionToken);
  }

  checkPermission(permission: AuthPermission): boolean {
    const { key, type } = permission;
    const permissions = this.snapshot.permissions;
    if (!permissions) {
      return false;
    }

    const result = permissions.find((p) => p.PrgCode === key);
    if (result) {
      return result[type];
    } else {
      return false;
    }
  }

  /**
   * @param  {string} returnUrl?
   * @returns boolean -> For acknowledge reload after called logout()
   */
  logout(returnUrl?: string): boolean {
    const clearAuth = () => {
      this.localStorageService.removeItemStorageKey('user');
      this.sessionStorageService.removeItemStorageKey('permission');

      this._currentUser$.next(undefined);
      this._userPermissions$.next(undefined);
      this._isLoading$.next(false);

      this.router.navigate(
        ['/', ROUTER_KEYS.auth.index, ROUTER_KEYS.auth.login],
        {
          queryParams: { returnUrl },
          queryParamsHandling: 'merge',
          preserveFragment: true,
        }
      );
    };

    // const auth = this.getAuthFromLocalStorage();

    clearAuth();
    return true;
  }

  //#region private
  private setAuthFromLocalStorage(auth: AccountLoginRes): void {
    // this.localStorageService.setItemStorageKey('user', JSON.stringify(auth));
    this.localStorageService.setItemStorageKey(
      'user',
      this.cryptoService.encryptData(auth)
    );
  }

  private getAuthFromLocalStorage() {
    const userHashed = this.localStorageService.getItemStorageKey<string>(
      'user',
      false
    );
    return userHashed
      ? this.cryptoService.decryptData<AccountLoginRes | undefined>(userHashed)
      : undefined;
  }
  getListServer() {
    return this.authHttp.getListServer();
  }
  confirmCode(code :any) {
    return this.authHttp.confirmCode(code);
  }
  //#endregion
}
