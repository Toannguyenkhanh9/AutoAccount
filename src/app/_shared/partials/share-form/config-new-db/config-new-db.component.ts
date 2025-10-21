import {
  Component,
  computed,
  signal,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subscription, finalize } from 'rxjs';
import { BookHttpService } from 'src/app/_shared/services/api/http';
import { ListServerRes } from 'src/app/_shared/models/account/listserver.model';

type CoaTemplate = 'TRADING' | 'SERVICE' | 'MANUFACTURING';
type CountryKey =
  | 'Malaysia'
  | 'Vietnam'
  | 'Singapore'
  | 'Thailand'
  | 'United States';

interface CurrencyInfo {
  localCurrencyCode: string; // RM, ₫, S$, ...
  symbol: string; // MYR, VND, ...
  wordEn: string; // RINGGIT MALAYSIA, ...
  wordLocal: string; // 马币, 越南盾, ...
}

const COUNTRY_CURRENCIES: Record<CountryKey, CurrencyInfo> = {
  Malaysia: {
    localCurrencyCode: 'RM',
    symbol: 'MYR',
    wordEn: 'RINGGIT MALAYSIA',
    wordLocal: '马币',
  },
  Vietnam: {
    localCurrencyCode: '₫',
    symbol: 'VND',
    wordEn: 'VIETNAMESE DONG',
    wordLocal: '越南盾',
  },
  Singapore: {
    localCurrencyCode: 'S$',
    symbol: 'SGD',
    wordEn: 'SINGAPORE DOLLAR',
    wordLocal: '新币',
  },
  Thailand: {
    localCurrencyCode: '฿',
    symbol: 'THB',
    wordEn: 'THAI BAHT',
    wordLocal: '泰铢',
  },
  'United States': {
    localCurrencyCode: '$',
    symbol: 'USD',
    wordEn: 'US DOLLAR',
    wordLocal: '美元',
  },
};

@Component({
  selector: 'app-config-new-db',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './config-new-db.component.html',
  styleUrls: ['./config-new-db.component.scss'],
})
export class ConfigNewDbComponent {
  @Output() cancel = new EventEmitter<void>();
  private _subscriptions$: Subscription[] = [];
  private booksHttp = inject(BookHttpService);
  countries: CountryKey[] = Object.keys(COUNTRY_CURRENCIES) as CountryKey[];
  step = signal(0);
  form: FormGroup;
  currencies = ['MYR', 'USD', 'SGD', 'EUR'];
  coaTemplates: { value: CoaTemplate; label: string }[] = [
    { value: 'TRADING', label: 'Trading' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
  ];
  request!: ListServerRes;
  // Dialog tạo xong (tuỳ chọn)
  showDone = signal(false);
  creating = false;
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      company: this.fb.group({
        code: ['', [Validators.required]],
        name: ['',
        ],
      }),
      period: this.fb.group({
        fiscalYearStartMonth: ['2025-01-01', [Validators.required]],
        openingDate: ['2025-01-01', [Validators.required]],
      }),
      country: [null, Validators.required],
      localCurrencyCode: [''],
      symbol: [''],
      wordEn: [''],
      wordLocal: [''],
      number: this.fb.group({
        qtyDecimals: ['AAA-AAAA'],
      }),
      coa: this.fb.group({
        template: ['TRADING' as CoaTemplate, [Validators.required]],
        importSampleOpening: [false],
      }),
    });
    this.form.get('country')!.valueChanges.subscribe((c: CountryKey | null) => {
      if (!c) return;
      const info = COUNTRY_CURRENCIES[c];
      this.form.patchValue(
        {
          localCurrencyCode: info.localCurrencyCode,
          symbol: info.symbol,
          wordEn: info.wordEn,
          wordLocal: info.wordLocal,
        },
        { emitEvent: false }
      );
    });
  }
  createNow() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }
    this.creating = true;
    const payload = this.form.value;
    const req: ListServerRes = {
      Id: 0,
      Company: payload.company.code,
      Remark: '',
      Version: '',
      Server: '',
      Database: payload.company.name,
      ConnectionString: '',
    };
 this._subscriptions$.push(
    this.booksHttp.insertBook(req)
      .pipe(finalize(() => { this.creating = false; }))
      .subscribe({
        next: (res) => {
          // xử lý thành công
          this.showDone.set(true);
        },
        error: (err) => {
          console.error(err);
          alert('Save failed');
        }
      })
  );
  }
  onCancel() {
    this.cancel.emit(); // báo cho parent đóng popup
  }
  closeDone() {
    this.showDone.set(false);
    this.onCancel();
  }
}
