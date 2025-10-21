import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { first } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ListServerRes } from 'src/app/_shared/models/account';
import { ServerSessionService } from 'src/app/_shared/services/session/server-session.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  private subscriptions$: Subscription[] = [];

  listserver: ListServerRes[] = []; // luôn là array
  isLoading = signal(false);

  // grid chọn Cty
  selectedCompanyIndex: number | null = null;
  systemDates = ['12/07/2009, Sunday', '13/07/2009, Monday'];
  systemDate = this.systemDates[0];

  onSelectCompany(i: number) {
    this.selectedCompanyIndex = i;
  }
  onExit() {
    history.back();
  }

  // Login form
  loginForm: FormGroup;
  hasError = false;
  returnUrl: string;
  isLoading$ = this.authService.isLoading$;

  // Popup nhập setup code
  showCodeDialog = false;
  showSetupNewDb = false;
  showSelectServerDialog = false;
  codeForm: FormGroup;
  codeError = '';

  get f() {
    return this.loginForm.controls;
  }
  get cf() {
    return this.codeForm.controls;
  }

  constructor(private session: ServerSessionService) {}

  ngOnInit(): void {
    if (this.authService.snapshot.user) {
      this.router.navigate(['/']);
      return;
    }

    this.initForm();
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    this.getListServer();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(320),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
    });

    this.codeForm = this.fb.group({
      code: ['', Validators.required],
    });
  }

  getListServer(): void {
    this.isLoading.set(true);
    this.subscriptions$.push(
      this.authService
        .getListServer()
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (res) => {
            this.listserver = Array.isArray(res) ? res : res ? [res] : [];
            this.cdr.markForCheck();
          },
          error: () => {
            this.listserver = [];
            this.cdr.markForCheck();
          },
        })
    );
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((sb) => sb.unsubscribe());
  }
  openSelectServerDialog() {
    this.showSelectServerDialog = true;
  }
  closeSelectServerDialog() {
    this.showSelectServerDialog = false;
  }
  submit() {
    if (this.selectedCompanyIndex === null) {
      this.openSelectServerDialog();
      return;
    }
    const row = this.listserver[this.selectedCompanyIndex]; // dòng đã chọn
    this.hasError = false;
    const sub = this.authService
      .loginFake(this.f.username.value, this.f.password.value)
      .pipe(first())
      .subscribe({
        next: (res) => {
          if(res === undefined || res === null){
            this.hasError = true;
            return false;
          }
          this.session.set({
            companyId: row.Id,
            companyName: row.Company ?? '', // default ''
            server: row.Server ?? '',
            database: row.Database ?? '',
            remark: row.Remark ?? undefined, // optional
            version: row.Version ?? undefined, // optional
            systemDate: this.systemDate ?? undefined, // tùy bạn
          });
          this.router.navigate([this.returnUrl]);
        },
        error: () => (this.hasError = true),
      });

    this.subscriptions$.push(sub);
  }
  submitFake() {
    this.hasError = false;
    const sub = this.authService
      .loginFake('demo', 'demo123')
      .pipe(first())
      .subscribe({
        next: () => this.openDatabaseSetup(),
        error: () => (this.hasError = true),
      });

    this.subscriptions$.push(sub);
  }
  openDatabaseSetup() {
    this.closeCodeDialog();
    this.showSetupNewDb = true;
    this.cdr.markForCheck();
  }

  /** Mở popup nhập setup code */
  onCreateDatabase() {
    this.codeError = '';
    this.codeForm.reset();
    this.showCodeDialog = true;
  }

  /** Đóng popup */
  closeCodeDialog() {
    this.showCodeDialog = false;
    this.cdr.markForCheck();
  }
  closeCodeDialogSetupNewDb() {
    this.showSetupNewDb = false;
    this.getListServer();
    this.cdr.markForCheck();
  }

  /** Gửi code lên server để verify; nếu ok → loginFake */
  confirmSetupCode() {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.codeError = '';
    const code = this.cf['code'].value as string;

    this.isLoading.set(true);
    const sub = this.authService
      .confirmCode(code) // API trả về Observable<boolean>
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (ok) => {
          if (ok.Success) {
            this.showCodeDialog = false;
            // gọi loginFake với user/pass đang nhập trong form
            this.submitFake();
          } else {
            this.codeError = 'Invalid setup code';
            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.codeError = 'Verify failed. Please try again.';
          this.cdr.markForCheck();
        },
      });

    this.subscriptions$.push(sub);
  }
}
