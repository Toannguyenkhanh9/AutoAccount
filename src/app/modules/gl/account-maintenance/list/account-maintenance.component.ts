import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type AccType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

interface Account {
  code: string;
  name: string;
  type: AccType;
  level: number;          // 1..5
  parent?: string | null; // parent account code
  currency: 'MYR' | 'USD';
  posting: boolean;       // posting account
  cashBank: boolean;      // is cash/bank
  active: boolean;
  note?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-account-maintenance',
  templateUrl: './account-maintenance.component.html',
  // styleUrls: ['./account-maintenance.component.scss']
})
export class AccountMaintenanceComponent {

  // --- toolbar/search/paging ---
  q = '';
  page = 1;
  pageSize = 10;

  // --- data (mock) ---
  accounts: Account[] = [
    { code: '1000', name: 'Cash in Hand', type: 'Asset', level: 1, parent: null, currency: 'MYR', posting: true, cashBank: true, active: true },
    { code: '1010', name: 'Cash at Bank - MAYBANK', type: 'Asset', level: 2, parent: '1000', currency: 'MYR', posting: true, cashBank: true, active: true },
    { code: '1020', name: 'Cash at Bank - RHB', type: 'Asset', level: 2, parent: '1000', currency: 'MYR', posting: true, cashBank: true, active: true },
    { code: '1100', name: 'Trade Debtors', type: 'Asset', level: 1, parent: null, currency: 'MYR', posting: false, cashBank: false, active: true },
    { code: '1101', name: 'Debtor - Care Phone Sdn Bhd', type: 'Asset', level: 2, parent: '1100', currency: 'MYR', posting: true, cashBank: false, active: true },
    { code: '2000', name: 'Trade Creditors', type: 'Liability', level: 1, parent: null, currency: 'MYR', posting: false, cashBank: false, active: true },
    { code: '2001', name: 'Creditor - Best Phone Sdn Bhd', type: 'Liability', level: 2, parent: '2000', currency: 'MYR', posting: true, cashBank: false, active: true },
    { code: '3000', name: 'Share Capital', type: 'Equity', level: 1, parent: null, currency: 'MYR', posting: true, cashBank: false, active: true },
    { code: '4000', name: 'Sales', type: 'Revenue', level: 1, parent: null, currency: 'MYR', posting: true, cashBank: false, active: true },
    { code: '5000', name: 'Cost of Sales', type: 'Expense', level: 1, parent: null, currency: 'MYR', posting: true, cashBank: false, active: true },
  ];

  selected: Account | null = null;

  // --- modal state ---
  showDialog = false;
  editMode = false;
  form: Account = this.blank();

  // helpers
  blank(): Account {
    return {
      code: '',
      name: '',
      type: 'Asset',
      level: 1,
      parent: null,
      currency: 'MYR',
      posting: true,
      cashBank: false,
      active: true,
      note: ''
    };
  }

  filtered(): Account[] {
    const k = this.q.trim().toLowerCase();
    const list = !k
      ? this.accounts
      : this.accounts.filter(a =>
          a.code.toLowerCase().includes(k) ||
          a.name.toLowerCase().includes(k) ||
          (a.parent ?? '').toLowerCase().includes(k) ||
          a.type.toLowerCase().includes(k)
        );
    // simple sort by code asc then level
    return [...list].sort((a,b) => a.code.localeCompare(b.code) || a.level - b.level);
  }

  pageCount(): number {
    const n = this.filtered().length;
    return n === 0 ? 1 : Math.ceil(n / this.pageSize);
  }

  // toolbar actions
  refresh() {
    // demo: nothing to do
  }
  printListing() {
    // simple print listing window
    const rows = this.filtered().map(a => `${a.code}  ${a.name}  ${a.type}  L${a.level}`).join('\n');
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre style="font:12px/1.4 monospace">${rows}</pre>`);
      w.document.close();
    }
  }
  findFocus(input: HTMLInputElement) { input.focus(); }

  // CRUD
  openNew() {
    this.editMode = false;
    this.form = this.blank();
    this.showDialog = true;
  }
  openEdit() {
    if (!this.selected) return;
    this.editMode = true;
    this.form = JSON.parse(JSON.stringify(this.selected));
    this.showDialog = true;
  }
  delete() {
    if (!this.selected) return;
    this.accounts = this.accounts.filter(x => x !== this.selected);
    this.selected = null;
  }
  save() {
    if (!this.form.code || !this.form.name) return;
    if (this.editMode) {
      const i = this.accounts.findIndex(a => a.code === this.form.code);
      if (i >= 0) this.accounts[i] = JSON.parse(JSON.stringify(this.form));
      else this.accounts.push(JSON.parse(JSON.stringify(this.form)));
    } else {
      // prevent duplicate code
      if (this.accounts.some(a => a.code === this.form.code)) return;
      this.accounts.push(JSON.parse(JSON.stringify(this.form)));
    }
    this.closeDialog();
  }
  closeDialog() { this.showDialog = false; }

  // small helpers for dropdowns
  parentsFor(level: number): string[] {
    if (level <= 1) return [];
    const up = level - 1;
    return this.accounts.filter(a => a.level === up).map(a => a.code);
  }
}
