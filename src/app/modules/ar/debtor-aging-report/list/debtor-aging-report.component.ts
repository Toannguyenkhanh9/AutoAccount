import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

interface DocRow {
  debtorCode: string;
  debtorName: string;
  salesAgent: string;
  docDate: string;     // ISO yyyy-MM-dd
  term: number;        // credit term (days)
  currency: 'MYR'|'USD';
  rate: number;        // to local
  amount: number;      // foreign amount
  outstanding: number; // foreign outstanding
}

interface AgingLine {
  debtorCode: string;
  debtorName: string;
  salesAgent: string;
  current: number;
  d1_30: number;
  d31_60: number;
  d61_90: number;
  over90: number;
  total: number;
}

@Component({
  selector: 'app-debtor-aging-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './debtor-aging-report.component.html',
  styleUrls: ['./debtor-aging-report.component.scss']
})
export class DebtorAgingReportComponent {
  // ===== Sample documents =====
  docs: DocRow[] = [
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD',  salesAgent:'TEH',  docDate:'2025-07-20', term:30, currency:'MYR', rate:1, amount:3999, outstanding:3999},
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD',  salesAgent:'TEH',  docDate:'2025-06-10', term:30, currency:'MYR', rate:1, amount:120,  outstanding:120},
    {debtorCode:'300-C001',debtorName:'CARE PHONE SDN BHD',  salesAgent:'FION', docDate:'2025-08-08', term:7,  currency:'MYR', rate:1, amount:49,   outstanding:49},
    {debtorCode:'300-D001',debtorName:'DOCTOR MOBILE ZONE',  salesAgent:'JLO',  docDate:'2025-07-05', term:21, currency:'MYR', rate:1, amount:150,  outstanding:150},
  ];

  // ===== Options / form =====
  fg: FormGroup;
  showOptions = true;
  showPreview = signal(false);

  constructor(private fb: FormBuilder){
    const today = new Date().toISOString().slice(0,10);
    this.fg = this.fb.group({
      asOf: [today],
      debtor: [''],
      bucketSize: [30],
      groupBy: ['none'],           // none | salesAgent
      showCriteria: [true],
      includeZero: [false],
    });
  }

  // ===== Utilities =====
  private addDays(d: Date, days: number){ const x = new Date(d); x.setDate(x.getDate()+days); return x; }
  private daysBetween(a: Date, b: Date){ return Math.floor((+a - +b) / 86400000); }

  // ===== Filter + per-document computed =====
  filteredDocs = computed(() => {
    const f = this.fg.value as any;
    const asOf = new Date(f.asOf);
    const q = (f.debtor ?? '').toLowerCase();

    return this.docs
      .filter(r => !q || r.debtorCode.toLowerCase().includes(q) || r.debtorName.toLowerCase().includes(q))
      .map(r => {
        const due = this.addDays(new Date(r.docDate), r.term);
        const daysPastDue = this.daysBetween(asOf, due); // negative => not due
        const localOutstanding = r.outstanding * r.rate;
        return {...r, due, daysPastDue, localOutstanding};
      })
      .filter(r => r.localOutstanding > 0); // aging thường chỉ với số dư > 0
  });

  // ===== Aggregate to aging lines (per debtor) =====
  agingLines = computed(() => {
    const f = this.fg.value as any;
    const bucket = Number(f.bucketSize) || 30;
    const map = new Map<string, AgingLine>();

    for (const r of this.filteredDocs()) {
      const key = r.debtorCode;
      if (!map.has(key)) {
        map.set(key, {
          debtorCode: r.debtorCode,
          debtorName: r.debtorName,
          salesAgent: r.salesAgent,
          current: 0, d1_30: 0, d31_60: 0, d61_90: 0, over90: 0, total: 0
        });
      }
      const line = map.get(key)!;
      const val = r.localOutstanding;

      if (r.daysPastDue <= 0) line.current += val;
      else if (r.daysPastDue <= bucket) line.d1_30 += val;
      else if (r.daysPastDue <= bucket*2) line.d31_60 += val;
      else if (r.daysPastDue <= bucket*3) line.d61_90 += val;
      else line.over90 += val;

      line.total = line.current + line.d1_30 + line.d31_60 + line.d61_90 + line.over90;
    }

    let arr = Array.from(map.values());
    if (!(this.fg.value as any).includeZero) {
      arr = arr.filter(x => x.total > 0);
    }
    // sort by debtor code for stability
    arr.sort((a,b)=> a.debtorCode.localeCompare(b.debtorCode));
    return arr;
  });

  // ===== Totals =====
  totals = computed(() => {
    const a = this.agingLines();
    const sum = (k: keyof AgingLine) => a.reduce((s,x)=> s + (x[k] as number), 0);
    return {
      current: +(sum('current')).toFixed(2),
      d1_30: +(sum('d1_30')).toFixed(2),
      d31_60: +(sum('d31_60')).toFixed(2),
      d61_90: +(sum('d61_90')).toFixed(2),
      over90: +(sum('over90')).toFixed(2),
      total: +(sum('total')).toFixed(2),
    };
  });

  // ===== Grouped by sales agent (optional) =====
  grouped = computed(() => {
    const by = (this.fg.value as any).groupBy as string;
    if (by === 'none') return [] as Array<{key:string, items:AgingLine[], totals:any}>;
    const mp = new Map<string, AgingLine[]>();

    for (const line of this.agingLines()) {
      const key = line.salesAgent || '(No Agent)';
      const list = mp.get(key);
      if (list) list.push(line); else mp.set(key, [line]);
    }

    const out: Array<{key:string, items:AgingLine[], totals:any}> = [];
    for (const [key, items] of mp.entries()) {
      const sum = (k: keyof AgingLine) => items.reduce((s,x)=> s + (x[k] as number), 0);
      out.push({
        key, items,
        totals: {
          current:+(sum('current')).toFixed(2),
          d1_30:+(sum('d1_30')).toFixed(2),
          d31_60:+(sum('d31_60')).toFixed(2),
          d61_90:+(sum('d61_90')).toFixed(2),
          over90:+(sum('over90')).toFixed(2),
          total:+(sum('total')).toFixed(2),
        }
      });
    }
    // keep stable order
    out.sort((a,b)=> a.key.localeCompare(b.key));
    return out;
  });

  // ===== Actions =====
  inquiry(){ this.showPreview.set(false); }
  preview(){ this.showPreview.set(true); }
  print(){ window.print(); }
  toggleOptions(){ this.showOptions = !this.showOptions; }
}
