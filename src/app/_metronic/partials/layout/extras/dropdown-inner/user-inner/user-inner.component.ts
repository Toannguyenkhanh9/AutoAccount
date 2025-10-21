import {
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import * as rxjs from 'rxjs';
import { TranslationService } from 'src/app/modules/i18n';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  private authService = inject(AuthService);
  private translationService = inject(TranslationService);
  private subscriptions$: rxjs.Subscription[] = [];
  showLogoutConfirm = false;
  isBackingUp = false;

  openLogoutConfirm() { this.showLogoutConfirm = true; }
  cancelLogout() { this.showLogoutConfirm = false; }
  logoutOnly() {
    this.authService.logout();
    document.location.reload();
  }
  backupAndLogout() {
    this.isBackingUp = true;
    this.logoutOnly()
    // gọi API backup; xong thì logout
  }

  language: LanguageFlag;
  user$ = this.authService.currentUser$;
  langs = languages;

  constructor() {}

  ngOnInit(): void {
    this.setLanguage(this.translationService.getSelectedLanguage());
  }

  logout() {
    this.authService.logout();
    document.location.reload();
  }

  selectLanguage(lang: string) {
    this.translationService.setLanguage(lang);
    this.setLanguage(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
        this.language = language;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions$.forEach((sb) => sb.unsubscribe());
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  {
    lang: 'zh',
    name: 'Chinese',
    flag: './assets/media/flags/united-states.svg',
  },
];
