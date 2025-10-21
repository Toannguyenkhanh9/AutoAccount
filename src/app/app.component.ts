import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { NgSelectConfig } from '@ng-select/ng-select';

// language list
import { TranslationService } from './modules/i18n';
import { locale as enLang } from './modules/i18n/vocabs/en';
import { locale as chLang } from './modules/i18n/vocabs/ch';
import { locale as esLang } from './modules/i18n/vocabs/es';
import { locale as jpLang } from './modules/i18n/vocabs/jp';
import { locale as deLang } from './modules/i18n/vocabs/de';
import { locale as frLang } from './modules/i18n/vocabs/fr';

import { ThemeModeService } from './_metronic/partials/layout/theme-mode-switcher/theme-mode.service';
import { AppService } from './_shared/services/app';

@Component({
  // tslint:disable-next-line:component-selector
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'body[root]',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private translationService = inject(TranslationService);
  private modeService = inject(ThemeModeService);
  private appService = inject(AppService);
  private ngSelectConfig = inject(NgSelectConfig);

  constructor() {
    // register translations
    this.translationService.loadTranslations(
      enLang,
      chLang,
      esLang,
      jpLang,
      deLang,
      frLang
    );

    // this.ngSelectConfig.notFoundText = 'No results found';
    this.ngSelectConfig.appendTo = 'body';
  }

  ngOnInit() {
    this.appService.checkVersion();
    this.modeService.init();
    this.appService.setEmbedLayout();
  }
}
