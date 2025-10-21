import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Routes } from '@angular/router';

type Currency = 'MYR' | 'USD';

interface Creditor {
  code: string;
  name: string;
}

interface InvoiceLine {
  uom: string;
  qty: number;
  unitPrice: number;
  tax: number;     // %
  amount: number;  // computed
}

interface ApInvoice {
  docNo: string;
  date: string; // ISO yyyy-MM-dd
  creditorCode: string;
  creditorName: string;
  currency: Currency;
  rate: number;
  status: 'POSTED' | 'DRAFT';
  localTotal: number;
  remark?: string;
  lines: InvoiceLine[];
}

@Component({
  selector: 'app-ap-invoice-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ap-invoice-page.component.html',
  // styleUrls: ['./ap-invoice-page.component.scss'],
})
export class ApInvoicePageComponent implements OnInit {
  // expose Math to template
  Math = Math;

  // ----- list data (mock) -----
  creditors: Creditor[] = [
    { code: 'SUP-0001', name: 'Local Marketing Sdn Bhd' },
    { code: 'SUP-0002', name: 'Best Phone Sdn Bhd' },
    { code: 'SUP-0003', name: 'Nova Gadgets' },
  ];

  rows: ApInvoice[] = [
    {
      docNo: 'PINV-00001',
      date: '2025-08-01',
      creditorCode: 'SUP-0002',
      creditorName: 'Best Phone Sdn Bhd',
      currency: 'MYR',
      rate: 1,
      status: 'POSTED',
      remark: 'Phones',
      localTotal: 7685.0,
      lines: [
        { uom: 'UNIT', qty: 10, unitPrice: 699, tax: 6, amount: 739.0 }, // amount đã ko dùng
      ],
    },
    {
      docNo: 'PINV-00002',
      date: '2025-08-05',
      creditorCode: 'SUP-0001',
      creditorName: 'Local Marketing Sdn Bhd',
      currency: 'MYR',
      rate: 1,
      status: 'POSTED',
      remark: 'Accessories',
      localTotal: 954.0,
      lines: [],
    },
  ];

  // ----- state -----
  q = '';
  page = 1;
  pageSize = 15;
  selected?: ApInvoice;

  // modal
  show = false;
  viewMode: 'new' | 'edit' | 'view' = 'new';

  // form
  form!: FormGroup;
  get linesFA(): FormArray<FormGroup> {
    return this.form.get('lines') as FormArray<FormGroup>;
  }
  get lineGroups() {
    return this.linesFA.controls as FormGroup[];
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private newLine(): FormGroup {
    return this.fb.group({
      uom: ['UNIT', Validators.required],
      qty: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.min(0)]],
      amount: [{ value: 0, disabled: true }],
    });
  }

  private initForm(row?: ApInvoice) {
    this.form = this.fb.group({
      docNo: [row?.docNo ?? ''],
      date: [row?.date ?? new Date().toISOString().slice(0, 10), Validators.required],
      creditorCode: [row?.creditorCode ?? null, Validators.required],
      creditorName: [row?.creditorName ?? '', Validators.required],
      rate: [row?.rate ?? 1, [Validators.required, Validators.min(0.0001)]],
      status: [row?.status ?? 'DRAFT', Validators.required],
      remark: [row?.remark ?? ''],
      lines: this.fb.array([]),
    });

    this.linesFA.clear();
    if (row?.lines?.length) {
      row.lines.forEach(l => {
        const g = this.newLine();
        g.patchValue(l);
        this.attachLineCalc(g);
        this.linesFA.push(g);
      });
    } else {
      const g = this.newLine();
      this.attachLineCalc(g);
      this.linesFA.push(g);
    }
  }

  private attachLineCalc(g: FormGroup) {
    g.valueChanges.subscribe(() => {
      const qty = Number(g.get('qty')?.value ?? 0);
      const price = Number(g.get('unitPrice')?.value ?? 0);
      const tax = Number(g.get('tax')?.value ?? 0);
      const base = qty * price;
      const amount = base + (base * tax) / 100;
      g.get('amount')?.setValue(+amount.toFixed(2), { emitEvent: false });
    });
  }

  // ---- list helpers ----
  filtered(): ApInvoice[] {
    const w = this.q.trim().toLowerCase();
    if (!w) return this.rows;
    return this.rows.filter(
      r =>
        r.docNo.toLowerCase().includes(w) ||
        r.creditorCode.toLowerCase().includes(w) ||
        r.creditorName.toLowerCase().includes(w)
    );
  }

  pageCount(): number {
    const len = this.filtered().length;
    return Math.max(1, Math.ceil(len / this.pageSize));
  }

  // ---- actions ----
  openNew() {
    this.viewMode = 'new';
    this.selected = undefined;
    this.initForm();
    this.show = true;
  }

  openEdit(row: ApInvoice) {
    this.viewMode = 'edit';
    this.selected = row;
    this.initForm(row);
    this.show = true;
  }

  openView(row: ApInvoice) {
    this.viewMode = 'view';
    this.selected = row;
    this.initForm(row);
    this.form.disable();
    this.show = true;
  }

  close() {
    this.show = false;
    this.form.enable();
  }

  addLine() {
    const g = this.newLine();
    this.attachLineCalc(g);
    this.linesFA.push(g);
  }

  removeLine(i: number) {
    this.linesFA.removeAt(i);
  }

  onCreditorChange() {
    const code = this.form.get('creditorCode')?.value as string | null;
    const found = this.creditors.find(c => c.code === code);
    this.form.get('creditorName')?.setValue(found?.name ?? '');
  }

  computeDocTotal(): number {
    let sum = 0;
    this.lineGroups.forEach(g => (sum += Number(g.get('amount')?.value ?? 0)));
    return +sum.toFixed(2);
  }

  save() {
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const data: ApInvoice = {
      docNo: v.docNo || this.nextDocNo(),
      date: v.date,
      creditorCode: v.creditorCode,
      creditorName: v.creditorName,
      currency: 'MYR',
      rate: Number(v.rate),
      status: v.status,
      remark: v.remark,
      lines: (v.lines as any[]).map(l => ({
        uom: l.uom,
        qty: Number(l.qty),
        unitPrice: Number(l.unitPrice),
        tax: Number(l.tax),
        amount: Number(l.amount),
      })),
      localTotal: this.computeDocTotal(),
    };

    if (this.viewMode === 'edit' && this.selected) {
      const idx = this.rows.findIndex(r => r.docNo === this.selected!.docNo);
      if (idx >= 0) this.rows[idx] = data;
    } else {
      this.rows = [data, ...this.rows];
    }

    this.close();
  }

  delete(row: ApInvoice) {
    this.rows = this.rows.filter(r => r.docNo !== row.docNo);
    if (this.selected?.docNo === row.docNo) this.selected = undefined;
  }

  private nextDocNo(): string {
    // simple running
    const last = this.rows
      .map(r => Number(r.docNo.replace(/\D/g, '')))
      .sort((a, b) => b - a)[0] ?? 0;
    return `PINV-${(last + 1).toString().padStart(5, '0')}`;
  }
}

/** Route cấu hình lazy cho page này */
export const AP_INVOICE_ROUTES: Routes = [
  { path: '', component: ApInvoicePageComponent },
];
