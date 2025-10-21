import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';
import { LocalStorageService } from './storage/local-storage.service';
import { SessionStorageService } from './storage/session-storage.service';
import { LayoutService } from 'src/app/_metronic/layout';
import { PageInfoService } from 'src/app/_metronic/layout/core/page-info.service';
import { TranslationService } from 'src/app/modules/i18n';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionStorageService = inject(SessionStorageService);
  private localStorageService = inject(LocalStorageService);
  private layoutService = inject(LayoutService);
  private pageInfoService = inject(PageInfoService);
  private translationService = inject(TranslationService);

  private readonly version: string;
  private isInitPostMessage = false;
  private _isEmbed$ = new BehaviorSubject<boolean>(false);

  public isEmbed$ = this._isEmbed$.asObservable();

  constructor() {
    this.version = environment.appVersion;
  }

  setEmbedTitle(title: string): void {
    setTimeout(() => {
      if (this._isEmbed$.value) {
        this.pageInfoService.updateTitle(title);
        this.pageInfoService.updateBreadcrumbs([]);
      }
    }, 100);
  }

  setEmbedLayout(): void {
    this.route.queryParams.subscribe((queryParams) => {
      const lang = queryParams['lang'];
      if (lang) {
        this.translationService.setLanguage(lang);
      }

      let isEmbed = false;

      const embedParam = queryParams['embed'];
      if (embedParam === 'true') {
        isEmbed = true;
      } else if (embedParam === 'false') {
        isEmbed = false;
      } else if (this.sessionStorageService.getItemStorageKey('embed')) {
        isEmbed = true;
      }
      this.sessionStorageService.setItemStorageKey('embed', isEmbed);

      if (isEmbed) {
        const currentConfig = {
          ...this.layoutService.layoutConfigSubject.value,
        };
        if (currentConfig && currentConfig.app && currentConfig.app.header) {
          currentConfig.app.header.display = false;

          if (currentConfig.app.header.default?.fixed) {
            currentConfig.app.header.default.fixed.desktop = false;
          }
        }
        if (currentConfig && currentConfig.app && currentConfig.app.toolbar) {
          // currentConfig.app.toolbar.display = false;
        }
        if (currentConfig && currentConfig.app && currentConfig.app.sidebar) {
          currentConfig.app.sidebar.display = false;
        }
        if (currentConfig && currentConfig.app && currentConfig.app.footer) {
          currentConfig.app.footer.display = false;
        }
        this.layoutService.tempUpdateBaseConfig(currentConfig);
        this.initEmitHeightPostMessage();
        this._isEmbed$.next(true);
      }
    });
  }

  checkVersion(): void {
    const currentVersion = this.localStorageService.getItemStorageKey(
      'version',
      false
    );

    if (currentVersion && currentVersion === this.version) {
      return;
    }

    this.localStorageService.clear();
    this.sessionStorageService.clear();
    this.localStorageService.setItemStorageKey('version', this.version);
    window.location.reload();
  }

  initEmitHeightPostMessage() {
    if (!this.isInitPostMessage) {
      function getMessage() {
        const body = document.body;
        const html = document.documentElement;
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
        const message = {
          type: 'jarvis',
          height,
        };
        return message;
      }

      window.parent.postMessage(getMessage(), '*');
      setInterval(() => {
        window.parent.postMessage(getMessage(), '*');
      }, 1000);

      this.isInitPostMessage = true;
    }
  }
}
