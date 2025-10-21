import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Routes } from '@angular/router';

type Currency = 'MYR' | 'USD';

interface Creditor { code: string; name: string; }
interface CnLine {
  uom: string;
  qty: number;
  unitPrice: number;
  tax: number;       // %
  amount: number;    // computed
}
interface ApCreditNote {
  docNo: string;
  date: string;
  creditorCode: string;
  creditorName: string;
  currency: Currency;
  rate: number;
  status: 'DRAFT' | 'POSTED';
  remark?: string;
  lines: CnLine[];
  localTotal: number;
}

@Component({
  selector: 'app-ap-credit-note-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ap-credit-note-page.component.html',
  styleUrls: ['./ap-credit-note-page.component.scss']
})
export class ApCreditNotePageComponent {
  Math = Math;

  // Mock creditors
  creditors: Creditor[] = [
    { code: 'SUP-0001', name: 'Local Marketing Sdn Bhd' },
    { code: 'SUP-0002', name: 'Best Phone Sdn Bhd' },
    { code: 'SUP-0003', name: 'Nova Gadgets' },
  ];

  // Mock data rows
  rows: ApCreditNote[] = [
    {
      docNo: 'APCN-00001',
      date: '2025-08-05',
      creditorCode: 'SUP-0002',
      creditorName: 'Best Phone Sdn Bhd',
      currency: 'MYR',
      rate: 1,
      status: 'POSTED',
      remark: 'Return of accessories',
      lines: [{ uom: 'UNIT', qty: 2, unitPrice: 100, tax: 0, amount: 200 }],
      localTotal: 200
    },
    {
      docNo: 'APCN-00002',
      date: '2025-08-10',
      creditorCode: 'SUP-0001',
      creditorName: 'Local Marketing Sdn Bhd',
      currency: 'MYR',
      rate: 1,
      status: 'POSTED',
      remark: 'Overcharge adjustment',
      lines: [{ uom: 'SERVICE', qty: 1, unitPrice: 80, tax: 6, amount: 84.8 }],
      localTotal: 84.8
    }
  ];

  q = '';
  selected?: ApCreditNote;
  page = 1;
  pageSize = 15;

  show = false;
  viewMode: 'new' | 'edit' | 'view' = 'new';

  form!: FormGroup;
  constructor(private fb: FormBuilder) { this.initForm(); }

  // ---------- helpers ----------
  get linesFA(): FormArray<FormGroup> { return this.form.get('lines') as FormArray<FormGroup>; }
  get lineGroups() { return this.linesFA.controls as FormGroup[]; }

  private newLine(): FormGroup {
    const g = this.fb.group({
      uom: ['UNIT', Validators.required],
      qty: [1, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      tax: [0, [Validators.min(0)]],
      amount: [{ value: 0, disabled: true }]
    });
    this.attachCalc(g);
    return g;
  }

  private attachCalc(g: FormGroup) {
    g.valueChanges.subscribe(() => {
      const qty  = +g.get('qty')!.value || 0;
      const up   = +g.get('unitPrice')!.value || 0;
      const tax  = +g.get('tax')!.value || 0;
      const base = qty * up;
      const amt  = base + base * tax / 100;
      g.get('amount')!.setValue(+amt.toFixed(2), { emitEvent: false });
    });
  }

  private initForm(row?: ApCreditNote) {
    this.form = this.fb.group({
      docNo: [row?.docNo ?? ''],
      date: [row?.date ?? new Date().toISOString().slice(0,10), Validators.required],
      creditorCode: [row?.creditorCode ?? null, Validators.required],
      creditorName: [row?.creditorName ?? '', Validators.required],
      rate: [row?.rate ?? 1, [Validators.required, Validators.min(0.0001)]],
      status: [row?.status ?? 'DRAFT', Validators.required],
      remark: [row?.remark ?? ''],
      lines: this.fb.array([])
    });

    this.linesFA.clear();
    if (row?.lines?.length) {
      row.lines.forEach(l => {
        const g = this.newLine();
        g.patchValue(l);
        this.linesFA.push(g);
      });
    } else {
      this.linesFA.push(this.newLine());
    }
  }

  // ---------- actions ----------
  filtered(): ApCreditNote[] {
    const w = this.q.trim().toLowerCase();
    if (!w) return this.rows;
    return this.rows.filter(r =>
      r.docNo.toLowerCase().includes(w) ||
      r.creditorCode.toLowerCase().includes(w) ||
      r.creditorName.toLowerCase().includes(w)
    );
  }
  pageCount(): number { return Math.max(1, Math.ceil(this.filtered().length / this.pageSize)); }

  onCreditorChange() {
    const code = this.form.get('creditorCode')?.value as string | null;
    const name = this.creditors.find(c => c.code === code)?.name ?? '';
    this.form.get('creditorName')?.setValue(name);
  }

  openNew()  { this.viewMode = 'new';  this.selected = undefined; this.initForm(); this.show = true; }
  openEdit(r: ApCreditNote) { this.viewMode = 'edit'; this.selected = r; this.initForm(r); this.show = true; }
  openView(r: ApCreditNote) { this.viewMode = 'view'; this.selected = r; this.initForm(r); this.form.disable(); this.show = true; }
  close() { this.show = false; this.form.enable(); }

  addLine() { this.linesFA.push(this.newLine()); }
  removeLine(i: number) { this.linesFA.removeAt(i); }

  computeTotal(): number {
    return +this.lineGroups.reduce((s, g) => s + (+g.get('amount')!.value || 0), 0).toFixed(2);
  }

  save() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const data: ApCreditNote = {
      docNo: v.docNo || this.nextDocNo(),
      date: v.date,
      creditorCode: v.creditorCode,
      creditorName: v.creditorName,
      currency: 'MYR',
      rate: +v.rate,
      status: v.status,
      remark: v.remark,
      lines: (v.lines as any[]).map(l => ({
        uom: l.uom, qty: +l.qty, unitPrice: +l.unitPrice, tax: +l.tax, amount: +l.amount
      })),
      localTotal: this.computeTotal()
    };

    if (this.viewMode === 'edit' && this.selected) {
      const idx = this.rows.findIndex(r => r.docNo === this.selected!.docNo);
      if (idx >= 0) this.rows[idx] = data;
    } else {
      this.rows = [data, ...this.rows];
    }
    this.close();
  }

  delete(r: ApCreditNote) {
    this.rows = this.rows.filter(x => x.docNo !== r.docNo);
    if (this.selected?.docNo === r.docNo) this.selected = undefined;
  }

  private nextDocNo(): string {
    const last = this.rows
      .map(r => +(r.docNo.replace(/\D/g, ''))).sort((a,b)=>b-a)[0] ?? 0;
    return `APCN-${(last + 1).toString().padStart(5, '0')}`;
  }
}

/** Route option (nếu bạn muốn lazy load page này) */
export const AP_CREDIT_NOTE_ROUTES: Routes = [
  { path: '', component: ApCreditNotePageComponent }
];
