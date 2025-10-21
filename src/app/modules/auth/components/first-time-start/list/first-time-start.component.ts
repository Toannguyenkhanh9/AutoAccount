import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type CoaTemplate = 'TRADING' | 'SERVICE' | 'MANUFACTURING';

@Component({
  selector: 'app-first-time-start',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './first-time-start.component.html',
  styleUrls: ['./first-time-start.component.scss']
})
export class FirstTimeStartComponent {

  // danh sách bước
  steps = [
    { key: 'company',  title: 'Company' },
    { key: 'period',   title: 'Accounting Period' },
    { key: 'currency', title: 'Currency & Tax' },
    { key: 'number',   title: 'Numbering & Rounding' },
    { key: 'coa',      title: 'Chart of Accounts' },
    { key: 'users',    title: 'Users' },
    { key: 'review',   title: 'Review & Create' }
  ] as const;

  step = signal(0);

  // form tổng
  form: FormGroup;

  // dữ liệu hỗ trợ
  currencies = ['MYR','USD','SGD','EUR'];
  months = [
    {v:1, n:'January'},{v:2,n:'February'},{v:3,n:'March'},{v:4,n:'April'},
    {v:5,n:'May'},{v:6,n:'June'},{v:7,n:'July'},{v:8,n:'August'},
    {v:9,n:'September'},{v:10,n:'October'},{v:11,n:'November'},{v:12,n:'December'}
  ];
  coaTemplates: {value: CoaTemplate; label: string}[] = [
    { value: 'TRADING', label: 'Trading' },
    { value: 'SERVICE', label: 'Service' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
  ];

  // Dialog tạo xong (tuỳ chọn)
  showDone = signal(false);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      company: this.fb.group({
        code:        ['ACC-0001', [Validators.required]],
        name:        ['My New Company Sdn Bhd', [Validators.required, Validators.minLength(3)]],
        regNo:       [''],
        taxRegNo:    [''],
        address1:    [''],
        address2:    [''],
        address3:    [''],
        postcode:    [''],
        city:        [''],
        state:       [''],
        country:     [''],
        phone:       [''],
        email:       [''],
        website:     ['']
      }),

      period: this.fb.group({
        fiscalYearStartMonth: [1, [Validators.required]],
        openingDate:          ['2025-01-01', [Validators.required]],
      }),

      currency: this.fb.group({
        baseCurrency:       ['MYR', [Validators.required]],
        priceIncludeTax:    [false],
        taxMethod:          ['EXCLUSIVE'], // EXCLUSIVE | INCLUSIVE
        defaultSalesTax:    ['SST-6%'],
        defaultPurchaseTax: ['SST-6%'],
      }),

      number: this.fb.group({
        qtyDecimals:   [2, [Validators.min(0), Validators.max(4)]],
        priceDecimals: [2, [Validators.min(0), Validators.max(4)]],
        amtDecimals:   [2, [Validators.min(0), Validators.max(4)]],
        // ví dụ pattern (chỉ là mô phỏng)
        invPattern: ['{yyyy}{MM}-{00000}', [Validators.required]],
        dnPattern:  ['DN-{yyyy}{MM}-{00000}', [Validators.required]],
        cnPattern:  ['CN-{yyyy}{MM}-{00000}', [Validators.required]],
        payPattern: ['PAY-{yyyy}{MM}-{00000}', [Validators.required]],
      }),

      coa: this.fb.group({
        template: ['TRADING' as CoaTemplate, [Validators.required]],
        importSampleOpening: [false],
      }),

      users: this.fb.group({
        adminUser:     ['ADMIN', [Validators.required]],
        adminPassword: ['', [Validators.required, Validators.minLength(4)]],
        confirmPass:   ['']
      }),
    });
  }

  // tiện ích
  isCurrent(i: number) { return this.step() === i; }
  canPrev() { return this.step() > 0; }
  canNext() { return this.step() < this.steps.length - 1; }

  // validate từng step
  stepValid() {
    const i = this.step();
    const grpKey = this.steps[i].key;
    if (grpKey === 'review') return this.form.valid;
    const group = this.form.get(grpKey)! as FormGroup;
    group.markAllAsTouched();
    return group.valid;
  }

  next() {
    if (!this.stepValid()) return;
    if (this.canNext()) this.step.set(this.step() + 1);
  }

  prev() {
    if (this.canPrev()) this.step.set(this.step() - 1);
  }

  go(i: number) {
    // cho phép đi lùi tự do; đi tới thì check valid
    if (i <= this.step()) { this.step.set(i); return; }
    if (this.stepValid()) this.step.set(i);
  }

  passwordsMatch(): boolean {
    const u = this.form.get('users') as FormGroup;
    const a = u.get('adminPassword')?.value || '';
    const b = u.get('confirmPass')?.value || '';
    return String(a) === String(b);
  }

  // tóm tắt
  summary = computed(() => {
    const v = this.form.getRawValue();
    return {
      Company: {
        Code: v.company.code,
        Name: v.company.name,
        'Tax Reg No': v.company.taxRegNo || '-',
        Phone: v.company.phone || '-',
        Email: v.company.email || '-',
      },
      'Accounting Period': {
        'Fiscal Start Month': this.months.find(m => m.v === v.period.fiscalYearStartMonth)?.n,
        'Opening Date': v.period.openingDate
      },
      'Currency & Tax': {
        'Base Currency': v.currency.baseCurrency,
        'Price Include Tax': v.currency.priceIncludeTax ? 'Yes' : 'No',
        'Tax Method': v.currency.taxMethod,
        'Default Sales Tax': v.currency.defaultSalesTax,
        'Default Purchase Tax': v.currency.defaultPurchaseTax,
      },
      'Numbering & Rounding': {
        'Qty Decimals': v.number.qtyDecimals,
        'Price Decimals': v.number.priceDecimals,
        'Amount Decimals': v.number.amtDecimals,
        'Invoice Pattern': v.number.invPattern,
        'Debit Note Pattern': v.number.dnPattern,
        'Credit Note Pattern': v.number.cnPattern,
        'Payment Pattern': v.number.payPattern,
      },
      'Chart of Accounts': {
        Template: this.coaTemplates.find(t => t.value === v.coa.template)?.label,
        'Import Sample Opening': v.coa.importSampleOpening ? 'Yes' : 'No',
      },
      Users: {
        'Admin User': v.users.adminUser
      }
    };
  });

  createNow() {
    if (!this.form.valid || !this.passwordsMatch()) return;
    // giả lập tạo xong
    this.showDone.set(true);
  }

  closeDone() { this.showDone.set(false); }
}
