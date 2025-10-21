import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type DocType = 'INV' | 'DN';

interface Row {
  debtorCode: string;
  debtorName: string;
  salesAgent: string;
  docType: DocType;
  docNo: string;
  docDate: string;     // ISO yyyy-MM-dd
  term: number;        // days
  currency: 'MYR' | 'USD';
  rate: number;        // to local
  amount: number;      // foreign amount
  outstanding: number; // foreign outstanding
}

@Component({
  selector: 'app-ar-outstanding-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ar-outstanding-report.component.html',
  styleUrls: ['./ar-outstanding-report.component.scss']
})
export class ArOutstandingReportComponent {
  // ===== Sample data =====
  rows: Row[] = [
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', salesAgent:'TEH',  docType:'INV', docNo:'INV-0015', docDate:'2025-08-05', term:30, currency:'MYR', rate:1, amount:3999, outstanding:3999},
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', salesAgent:'TEH',  docType:'DN',  docNo:'DN-0008',  docDate:'2025-08-09', term:14, currency:'MYR', rate:1, amount:120,  outstanding:120},
    {debtorCode:'300-C001',debtorName:'CARE PHONE SDN BHD', salesAgent:'FION', docType:'INV', docNo:'INV-1010', docDate:'2025-08-02', term:7,  currency:'MYR', rate:1, amount:49,   outstanding:49},
    {debtorCode:'300-D001',debtorName:'DOCTOR MOBILE ZONE', salesAgent:'JLO',  docType:'INV', docNo:'INV-2005', docDate:'2025-08-03', term:21, currency:'MYR', rate:1, amount:150,  outstanding:150},
  ];

  // ===== Filters / options =====
  fg: FormGroup;
  showOptions = true;
  showPreview = signal(false);

  constructor(private fb: FormBuilder){
    const today = new Date().toISOString().slice(0,10);
    this.fg = this.fb.group({
      asOf: [today],
      debtor: [''],               // filter by code/name
      typePreset: ['INV_DN'],     // INV_ONLY | DN_ONLY | INV_DN
      sortBy: ['docDate'],        // docDate|docNo|debtorCode|debtorName|salesAgent
      groupBy: ['none'],          // none|debtorCode|salesAgent
      showCriteria: [true],
    });
  }

  // ===== Derived: filtered rows with computed fields =====
  filtered = computed(() => {
    const f = this.fg.value as any;
    const asOf = new Date(f.asOf);
    const debtorQ = (f.debtor ?? '').toLowerCase();
    const useINV = f.typePreset !== 'DN_ONLY';
    const useDN  = f.typePreset !== 'INV_ONLY';

    // filter and compute
    let out = this.rows
      .filter(r => {
        const okType = (r.docType==='INV' && useINV) || (r.docType==='DN' && useDN);
        const okDebtor = !debtorQ ||
          r.debtorCode.toLowerCase().includes(debtorQ) ||
          r.debtorName.toLowerCase().includes(debtorQ);
        return okType && okDebtor && r.outstanding > 0;
      })
      .map(r => {
        const age = Math.max(0, Math.floor((+asOf - +new Date(r.docDate)) / 86400000) - r.term);
        const localAmount = r.amount * r.rate;
        const localOutstanding = r.outstanding * r.rate;
        return {...r, age, localAmount, localOutstanding};
      });

    // sort
    const sortKey = f.sortBy as string;
    out = [...out].sort((a:any,b:any) => String(a[sortKey]).localeCompare(String(b[sortKey])));

    return out;
  });

  totals = computed(() => {
    const a = this.filtered();
    const sum = (k: string) => a.reduce((s:any,r:any)=> s + (r[k]||0), 0);
    return {
      localAmount:       +sum('localAmount').toFixed(2),
      localOutstanding:  +sum('localOutstanding').toFixed(2),
    };
  });

  // ===== Grouped view (for groupBy !== 'none') =====
  grouped = computed(() => {
    const by = (this.fg.value as any).groupBy as string;
    if (by === 'none') return [] as Array<{key:string, items:any[], totals:{localAmount:number, localOutstanding:number}}>;

    const arr = this.filtered();
    const map = new Map<string, any[]>();

    for (const r of arr) {
      const key = by === 'debtorCode' ? `${r.debtorCode} — ${r.debtorName}` : r.salesAgent;
      const list = map.get(key);
      if (list) list.push(r); else map.set(key, [r]);
    }

    return Array.from(map.entries()).map(([key, items]) => {
      const tLocalAmt = +items.reduce((s,x)=>s+x.localAmount,0).toFixed(2);
      const tLocalOut = +items.reduce((s,x)=>s+x.localOutstanding,0).toFixed(2);
      return { key, items, totals: { localAmount: tLocalAmt, localOutstanding: tLocalOut } };
    });
  });

  // ===== Actions =====
  inquiry(){ this.showPreview.set(false); }
  preview(){ this.showPreview.set(true); }
  print(){ window.print(); }
  toggleOptions(){ this.showOptions = !this.showOptions; }
}
