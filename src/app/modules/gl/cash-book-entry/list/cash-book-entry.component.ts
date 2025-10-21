import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type YesNo = 'Yes' | 'No';
type EntryType = 'Receipt' | 'Payment';

export interface CashBookEntry {
  id: string;
  type: EntryType;
  docNo: string;
  docDate: string;         // ISO yyyy-MM-dd
  cashBook: string;        // bank/cash account name
  payerPayee: string;      // payer (for payment) / payee (for receipt)
  description: string;
  currency: 'MYR' | 'USD';
  rate: number;
  amount: number;
  localAmount: number;
  posted: YesNo;
  reconciled: YesNo;
  reference?: string;
  remark?: string;
}

@Component({
  selector: 'app-cash-book-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cash-book-entry.component.html',
  styleUrls: ['./cash-book-entry.component.scss'],
})
export class CashBookEntryComponent {
  // search / filter
  q = '';
  typeFilter: EntryType | 'All' = 'All';

  // demo cash/bank books
  cashBooks = [
    'Cash on Hand',
    'Cash at Bank - Main',
    'Cash at Bank - Payroll',
  ];

  // demo data
  rows: CashBookEntry[] = [
    {
      id: 'R-20240801-001',
      type: 'Receipt',
      docNo: 'CR-202408-0001',
      docDate: '2024-08-01',
      cashBook: 'Cash at Bank - Main',
      payerPayee: 'ACME Trading',
      description: 'Customer receipt INV S-10021',
      currency: 'MYR',
      rate: 1,
      amount: 3200,
      localAmount: 3200,
      posted: 'Yes',
      reconciled: 'No',
      reference: 'S-10021',
      remark: '',
    },
    {
      id: 'P-20240803-001',
      type: 'Payment',
      docNo: 'PV-202408-0043',
      docDate: '2024-08-03',
      cashBook: 'Cash at Bank - Main',
      payerPayee: 'XYZ Supplies',
      description: 'Supplier payment AP INV P-8841',
      currency: 'USD',
      rate: 4.20,
      amount: 500,
      localAmount: 2100,
      posted: 'No',
      reconciled: 'No',
      reference: 'P-8841',
      remark: 'Urgent',
    },
    {
      id: 'R-20240805-002',
      type: 'Receipt',
      docNo: 'CR-202408-0012',
      docDate: '2024-08-05',
      cashBook: 'Cash on Hand',
      payerPayee: 'Walk-in Customer',
      description: 'Counter sales',
      currency: 'MYR',
      rate: 1,
      amount: 450,
      localAmount: 450,
      posted: 'Yes',
      reconciled: 'Yes',
    },
  ];

  selected: CashBookEntry | null = null;

  // modal state
  showModal = false;
  isEdit = false;

  // form model
  form: CashBookEntry = this.empty();

  private toISODateToday(): string {
    const today = new Date();
    const t = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    return t.toISOString().slice(0, 10);
  }

  empty(): CashBookEntry {
    return {
      id: '',
      type: 'Receipt',
      docNo: '',
      docDate: this.toISODateToday(),
      cashBook: this.cashBooks[0],
      payerPayee: '',
      description: '',
      currency: 'MYR',
      rate: 1,
      amount: 0,
      localAmount: 0,
      posted: 'No',
      reconciled: 'No',
      reference: '',
      remark: '',
    };
  }

  // computed
  filtered(): CashBookEntry[] {
    const s = this.q.trim().toLowerCase();
    return this.rows.filter(r => {
      const matchType = this.typeFilter === 'All' ? true : r.type === this.typeFilter;
      const hay = (r.type + ' ' + r.docNo + ' ' + r.cashBook + ' ' + r.payerPayee + ' ' + r.description + ' ' + (r.reference || '') + ' ' + (r.remark || '')).toLowerCase();
      return matchType && (!s || hay.includes(s));
    });
  }

  totalLocal() {
    return this.filtered().reduce((t, r) => t + (r.localAmount || 0), 0);
  }

  // toolbar actions
  onNew() {
    this.isEdit = false;
    this.form = this.empty();
    this.open();
  }
  onEdit() {
    if (!this.selected) return;
    this.isEdit = true;
    this.form = { ...this.selected };
    this.open();
  }
  onDelete() {
    if (!this.selected) return;
    this.rows = this.rows.filter(r => r !== this.selected);
    this.selected = null;
  }
  onRefresh() { /* demo no-op */ }
  onPrint()   { window.print(); }

  // select row
  pick(r: CashBookEntry) { this.selected = r; }
  isPicked(r: CashBookEntry) { return this.selected === r; }
  trackById(_: number, r: CashBookEntry) { return r.id; }

  // modal
  open() { this.showModal = true; }
  close() { this.showModal = false; }

  onCurrencyChange() {
    if (this.form.currency === 'MYR') this.form.rate = 1;
    this.recomputeLocal();
  }
  recomputeLocal() {
    const amt = Number(this.form.amount) || 0;
    const rate = Number(this.form.rate) || 0;
    this.form.localAmount = +(amt * rate).toFixed(2);
  }

  private lpad(s: string, width: number, padChar = '0') {
    if (s.length >= width) return s;
    return new Array(width - s.length + 1).join(padChar) + s;
  }

  save() {
    // validate
    if (!this.form.docNo.trim()) { alert('Document No is required'); return; }
    if (!this.form.docDate) { alert('Document Date is required'); return; }
    if (!this.form.cashBook) { alert('Cash/Bank Account is required'); return; }
    if (!this.form.payerPayee.trim()) { alert('Payer/Payee is required'); return; }

    if (this.isEdit) {
      const idx = this.rows.findIndex(r => r.id === this.form.id);
      if (idx >= 0) this.rows[idx] = { ...this.form };
    } else {
      // KHÔNG dùng replaceAll để tránh lỗi TS2550
      const yyyymmdd = this.form.docDate.split('-').join('');
      const rnd = this.lpad((Math.random() * 10000 | 0).toString(), 4, '0');
      const id = `${this.form.type[0]}-${yyyymmdd}-${rnd}`;
      this.rows = [...this.rows, { ...this.form, id }];
    }
    this.close();
  }
}
