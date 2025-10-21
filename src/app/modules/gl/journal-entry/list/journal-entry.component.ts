import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type YesNo = 'Yes' | 'No';

interface Account {
  code: string;
  name: string;
}
interface JournalLine {
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}
interface JournalEntry {
  id: string;
  docNo: string;
  docDate: string;         // yyyy-MM-dd
  journalType: string;     // e.g. GEN / ADJ / REV
  reference?: string;
  remark?: string;
  posted: YesNo;
  lines: JournalLine[];
}

@Component({
  selector: 'app-journal-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-entry.component.html',
  styleUrls: ['./journal-entry.component.scss'],
})
export class JournalEntryComponent {
  q = '';

  // Journal types demo
  journalTypes = [
    { code: 'GEN', name: 'General Journal' },
    { code: 'ADJ', name: 'Adjustment' },
    { code: 'REV', name: 'Reversal' },
  ];

  // Chart of accounts demo
  accounts: Account[] = [
    { code: '1000-000', name: 'Cash on Hand' },
    { code: '1010-000', name: 'Cash at Bank - Main' },
    { code: '1100-000', name: 'Accounts Receivable' },
    { code: '1200-000', name: 'Inventory' },
    { code: '2000-000', name: 'Accounts Payable' },
    { code: '4000-000', name: 'Sales' },
    { code: '5000-000', name: 'Cost of Goods Sold' },
    { code: '6000-000', name: 'Operating Expenses' },
  ];

  // Data mẫu
  rows: JournalEntry[] = [
    {
      id: 'JV-20240801-0001',
      docNo: 'JV-202408-0001',
      docDate: '2024-08-01',
      journalType: 'GEN',
      reference: 'Open balance adj.',
      remark: '',
      posted: 'Yes',
      lines: [
        { accountCode: '1100-000', accountName: 'Accounts Receivable', description: 'Opening AR', debit: 5000, credit: 0 },
        { accountCode: '4000-000', accountName: 'Sales',               description: 'Opening revenue', debit: 0, credit: 5000 },
      ],
    },
    {
      id: 'JV-20240803-0002',
      docNo: 'JV-202408-0002',
      docDate: '2024-08-03',
      journalType: 'ADJ',
      reference: 'Accrual expenses',
      remark: '',
      posted: 'No',
      lines: [
        { accountCode: '6000-000', accountName: 'Operating Expenses', description: 'Accrual', debit: 1200, credit: 0 },
        { accountCode: '2000-000', accountName: 'Accounts Payable',   description: 'Accrual', debit: 0, credit: 1200 },
      ],
    },
  ];

  // Selection
  selected: JournalEntry | null = null;

  // Modal state
  showModal = false;
  isEdit = false;

  // Form model
  form: JournalEntry = this.empty();

  private todayISO() {
    const t = new Date();
    const d = new Date(t.getTime() - t.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 10);
  }

  empty(): JournalEntry {
    return {
      id: '',
      docNo: '',
      docDate: this.todayISO(),
      journalType: 'GEN',
      posted: 'No',
      reference: '',
      remark: '',
      lines: [
        { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 },
        { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 },
      ],
    };
  }

  // List helpers
  filtered(): JournalEntry[] {
    const s = this.q.trim().toLowerCase();
    if (!s) return this.rows;
    return this.rows.filter(r => {
      const hay = (r.docNo + ' ' + r.docDate + ' ' + r.journalType + ' ' + (r.reference || '') + ' ' + (r.remark || '')).toLowerCase();
      return hay.includes(s);
    });
  }

  sumDebits(e: JournalEntry) { return e.lines.reduce((t, l) => t + (Number(l.debit) || 0), 0); }
  sumCredits(e: JournalEntry) { return e.lines.reduce((t, l) => t + (Number(l.credit) || 0), 0); }
  diff(e: JournalEntry) { return +(this.sumDebits(e) - this.sumCredits(e)).toFixed(2); }

  // Toolbar
  onNew() {
    this.isEdit = false;
    this.form = this.empty();
    this.open();
  }
  onEdit() {
    if (!this.selected) return;
    this.isEdit = true;
    this.form = JSON.parse(JSON.stringify(this.selected));
    this.open();
  }
  onDelete() {
    if (!this.selected) return;
    this.rows = this.rows.filter(r => r !== this.selected);
    this.selected = null;
  }
  onRefresh() { /* no-op demo */ }
  onPrint() { window.print(); }

  // Row select
  pick(r: JournalEntry) { this.selected = r; }
  isPicked(r: JournalEntry) { return this.selected === r; }
  trackById(_: number, r: JournalEntry) { return r.id; }

  // Modal
  open() { this.showModal = true; }
  close() { this.showModal = false; }

  addLine() {
    this.form.lines.push({ accountCode: '', accountName: '', description: '', debit: 0, credit: 0 });
  }
  removeLine(i: number) {
    this.form.lines.splice(i, 1);
  }
  onAccountChange(i: number) {
    const code = this.form.lines[i].accountCode;
    const a = this.accounts.find(x => x.code === code);
    this.form.lines[i].accountName = a?.name || '';
  }
  normalizeLine(i: number) {
    const l = this.form.lines[i];
    l.debit = Number(l.debit) || 0;
    l.credit = Number(l.credit) || 0;
    // chỉ cho nhập 1 bên
    if (l.debit > 0) l.credit = 0;
    if (l.credit > 0) l.debit = 0;
  }

  formDebits() { return this.form.lines.reduce((t,l)=> t + (Number(l.debit)||0), 0); }
  formCredits() { return this.form.lines.reduce((t,l)=> t + (Number(l.credit)||0), 0); }
  formBalanced() { return Math.abs(this.formDebits() - this.formCredits()) < 0.005; } // tolerance 0.01

  private lpad(s: string, width: number, padChar = '0') {
    if (s.length >= width) return s;
    return new Array(width - s.length + 1).join(padChar) + s;
  }

  save() {
    // validations
    if (!this.form.docNo.trim()) { alert('Document No is required'); return; }
    if (!this.form.docDate) { alert('Document Date is required'); return; }
    const hasAmount = this.form.lines.some(l => (l.debit||0) > 0 || (l.credit||0) > 0);
    if (!hasAmount) { alert('At least one line must have Debit or Credit.'); return; }
    if (!this.formBalanced()) { alert('Entry is not balanced. Debits must equal Credits.'); return; }

    if (this.isEdit) {
      const idx = this.rows.findIndex(r => r.id === this.form.id);
      if (idx >= 0) this.rows[idx] = JSON.parse(JSON.stringify(this.form));
    } else {
      const yyyymmdd = this.form.docDate.split('-').join('');
      const rnd = this.lpad((Math.random() * 10000 | 0).toString(), 4, '0');
      const id = `JV-${yyyymmdd}-${rnd}`;
      const row: JournalEntry = { ...this.form, id };
      this.rows = [...this.rows, row];
    }
    this.close();
  }
}
