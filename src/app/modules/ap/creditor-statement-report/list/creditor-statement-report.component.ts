import { CommonModule } from '@angular/common';
import { Component, signal, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type Creditor = {
  code: string; name: string;
  area: 'CENTRAL'|'SOUTH'|'EAST'|'WEST';
  agent: 'TEH'|'FION'|'JLO'|'PT'|'AMY';
  opening?: number;
};

type Txn = {
  code: string; date: string; docNo: string; description: string;
  debit: number; credit: number;
};

type Summary = {
  code: string; name: string; area: string; agent: string;
  opening: number; debit: number; credit: number; closing: number;
};

@Component({
  selector: 'app-creditor-statement-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './creditor-statement-report.component.html',
  styleUrls: ['./creditor-statement-report.component.scss'],
})
export class CreditorStatementReportComponent {
  showOptions = true;
  showPreview = false;

  filters!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.filters = this.fb.group({
      dateFrom: '2025-08-01',
      dateTo: '2025-08-31',
      search: '',
      sortBy: 'code',     // 'code' | 'name' | 'agent'
      groupBy: 'none',    // 'none' | 'agent' | 'area'
      showCriteria: true
    });
  }

  // dữ liệu mẫu
  creditors: Creditor[] = [
    { code: 'SUP-0001', name: 'Local Marketing Sdn Bhd', area: 'CENTRAL', agent: 'JLO', opening: 0 },
    { code: 'SUP-0002', name: 'Best Phone Sdn Bhd',     area: 'SOUTH',   agent: 'TEH', opening: 0 },
    { code: 'SUP-0003', name: 'Nova Gadgets',           area: 'EAST',    agent: 'AMY', opening: 0 },
    { code: 'SUP-0004', name: 'P2P Marketing Sdn Bhd',  area: 'CENTRAL', agent: 'PT',  opening: 0 },
  ];

  txns: Txn[] = [
    { code: 'SUP-0001', date: '2025-08-01', docNo: 'PINV-00010', description: 'Purchase – Galaxy S24', debit: 0, credit: 1250 },
    { code: 'SUP-0001', date: '2025-08-12', docNo: 'PV-00035',   description: 'AP Payment',             debit: 300, credit: 0 },
    { code: 'SUP-0002', date: '2025-08-03', docNo: 'PINV-00011', description: 'Phone case',             debit: 0, credit: 1000 },
    { code: 'SUP-0003', date: '2025-08-05', docNo: 'PINV-00012', description: 'Parts & Accessories',    debit: 0, credit: 1800 },
    { code: 'SUP-0004', date: '2025-08-07', docNo: 'PINV-00013', description: 'Return & misc',          debit: 0, credit: 1350 },
    { code: 'SUP-0003', date: '2025-08-19', docNo: 'PV-00048',   description: 'AP Payment',             debit: 500, credit: 0 },
  ];

  summaries = signal<Summary[]>([]);
  selectedCode = signal<string>('SUP-0001');

  ngOnInit() {
    this.inquiry();
    effect(() => {
      const rows = this.filteredSummaries();
      if (rows.length) this.selectedCode.set(rows[0].code);
    });
  }

  private inRange(d: string): boolean {
    const { dateFrom, dateTo } = this.filters.value;
    return (!dateFrom || d >= dateFrom!) && (!dateTo || d <= dateTo!);
  }

  inquiry() {
    const map: Record<string, Summary> = {};
    for (const c of this.creditors) {
      map[c.code] = {
        code: c.code, name: c.name, area: c.area, agent: c.agent,
        opening: c.opening ?? 0, debit: 0, credit: 0, closing: c.opening ?? 0
      };
    }
    for (const t of this.txns.filter(t => this.inRange(t.date))) {
      const s = map[t.code];
      if (!s) continue;
      s.debit += t.debit;
      s.credit += t.credit;
    }
    Object.values(map).forEach(s => s.closing = s.opening + s.credit - s.debit);

    const sort = this.filters.value.sortBy as string;
    const rows = Object.values(map).sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'agent') return a.agent.localeCompare(b.agent);
      return a.code.localeCompare(b.code);
    });
    this.summaries.set(rows);
  }

  filteredSummaries(): Summary[] {
    const q = (this.filters.value.search || '').toString().toLowerCase().trim();
    if (!q) return this.summaries();
    return this.summaries().filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.agent.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q)
    );
  }

  // tính toán cho preview (tránh dùng arrow function trong template)
  sumDebit(lines: Array<{debit:number}>): number {
    return lines.reduce((acc, l) => acc + (l.debit || 0), 0);
  }
  sumCredit(lines: Array<{credit:number}>): number {
    return lines.reduce((acc, l) => acc + (l.credit || 0), 0);
  }

  statementLines(code: string) {
    const c = this.creditors.find(x => x.code === code)!;
    const opening = c?.opening ?? 0;
    const lines = this.txns
      .filter(t => t.code === code && this.inRange(t.date))
      .sort((a, b) => a.date.localeCompare(b.date));

    let bal = opening;
    const withRun = lines.map(l => {
      bal = bal + l.credit - l.debit;
      return { ...l, balance: bal };
    });
    return { creditor: c, opening, lines: withRun, closing: bal };
  }

  openPreview(row?: Summary) {
    if (row) this.selectedCode.set(row.code);
    this.showPreview = true;
  }
  closePreview() { this.showPreview = false; }
  print() { setTimeout(() => window.print(), 50); }
}
