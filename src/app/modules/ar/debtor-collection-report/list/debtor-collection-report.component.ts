import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type Method = 'Cash' | 'Bank' | 'Cheque' | 'Transfer';

interface CollectionRow {
  receiptNo: string;
  date: string;            // ISO yyyy-MM-dd
  debtorCode: string;
  debtorName: string;
  salesAgent: string;
  method: Method;
  reference: string;       // cheque no / TT no
  amount: number;          // received (local)
  allocated: number;       // allocated to invoices
}

interface GroupBlock {
  key: string;
  items: CollectionRow[];
  totals: { amount: number; allocated: number; unallocated: number };
}

@Component({
  selector: 'app-debtor-collection-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './debtor-collection-report.component.html',
  styleUrls: ['./debtor-collection-report.component.scss'],
})
export class DebtorCollectionReportComponent {
  // --- sample data ---
  rows: CollectionRow[] = [
    {receiptNo:'RC-0008', date:'2025-08-10', debtorCode:'300-B001', debtorName:'BEST PHONE SDN BHD', salesAgent:'TEH',  method:'Bank',    reference:'TT-897223', amount:1500, allocated:1500},
    {receiptNo:'RC-0011', date:'2025-08-14', debtorCode:'300-B001', debtorName:'BEST PHONE SDN BHD', salesAgent:'TEH',  method:'Cheque', reference:'CHQ-55671', amount:800,  allocated:600},
    {receiptNo:'RC-0020', date:'2025-08-18', debtorCode:'300-C001', debtorName:'CARE PHONE SDN BHD', salesAgent:'FION', method:'Cash',    reference:'',          amount:49,   allocated:49},
    {receiptNo:'RC-0026', date:'2025-08-22', debtorCode:'300-D001', debtorName:'DOCTOR MOBILE ZONE', salesAgent:'JLO',  method:'Bank',    reference:'TT-905551', amount:500,  allocated:300},
    {receiptNo:'RC-0033', date:'2025-08-25', debtorCode:'300-P002', debtorName:'PHONE HOME TRADING', salesAgent:'PT',   method:'Transfer',reference:'FT-100233', amount:1200, allocated:1200},
  ];

  // --- options ---
  fg: FormGroup;
  showOptions = true;
  showPreview = signal(false);

  constructor(private fb: FormBuilder) {
    this.fg = this.fb.group({
      dateFrom: ['2025-08-01'],
      dateTo:   ['2025-08-31'],
      debtor:   [''],                 // code or name
      agent:    [''],                 // contains
      method:   ['All'],              // All | Cash | Bank | Cheque | Transfer
      groupBy:  ['none'],             // none | salesAgent | debtor
      showCriteria: [true],
      includeZero: [false],           // keep groups with zero movement
      sortBy: ['date'],               // date | receiptNo | debtor
    });
  }

  // utils
  private d(s: string){ return new Date(s+'T00:00:00'); }

  // filtered rows
  filtered = computed(() => {
    const f = this.fg.value as any;
    const from = this.d(f.dateFrom), to = this.d(f.dateTo);
    const qDebtor = (f.debtor ?? '').toLowerCase();
    const qAgent  = (f.agent  ?? '').toLowerCase();
    const method  = f.method as string;

    const out = this.rows.filter(r => {
      const inDate = this.d(r.date) >= from && this.d(r.date) <= to;
      const debtorOk = !qDebtor || (r.debtorCode + ' ' + r.debtorName).toLowerCase().includes(qDebtor);
      const agentOk  = !qAgent || r.salesAgent.toLowerCase().includes(qAgent);
      const methodOk = method === 'All' || r.method === method;
      return inDate && debtorOk && agentOk && methodOk;
    });

    const by = f.sortBy as string;
    out.sort((a,b)=>{
      if (by==='receiptNo') return a.receiptNo.localeCompare(b.receiptNo);
      if (by==='debtor')    return (a.debtorCode+a.debtorName).localeCompare(b.debtorCode+b.debtorName);
      return this.d(a.date).getTime() - this.d(b.date).getTime();
    });
    return out;
  });

  // totals (flat)
  totals = computed(()=> {
    const list = this.filtered();
    const amount = +list.reduce((s,x)=> s+x.amount, 0).toFixed(2);
    const allocated = +list.reduce((s,x)=> s+x.allocated, 0).toFixed(2);
    const unallocated = +(amount - allocated).toFixed(2);
    return { amount, allocated, unallocated };
  });

  // group blocks for template (avoid keyvalue pipe comparators)
  grouped = computed<GroupBlock[]>(() => {
    const f = this.fg.value as any;
    const mode = f.groupBy as string;
    if (mode === 'none') return [];

    const mp = new Map<string, CollectionRow[]>();
    for (const r of this.filtered()) {
      const key = mode === 'salesAgent' ? (r.salesAgent || '(No Agent)') : `${r.debtorCode} — ${r.debtorName}`;
      const list = mp.get(key);
      if (list) list.push(r); else mp.set(key, [r]);
    }

    const blocks: GroupBlock[] = [];
    for (const [key, items] of mp.entries()) {
      const amount = +items.reduce((s,x)=> s+x.amount, 0).toFixed(2);
      const allocated = +items.reduce((s,x)=> s+x.allocated, 0).toFixed(2);
      const unallocated = +(amount - allocated).toFixed(2);
      if (!(this.fg.value as any).includeZero && amount === 0 && allocated === 0) continue;
      blocks.push({ key, items, totals: { amount, allocated, unallocated } });
    }
    blocks.sort((a,b)=> a.key.localeCompare(b.key));
    return blocks;
  });

  // actions
  inquiry(){ this.showPreview.set(false); }
  preview(){ this.showPreview.set(true); }
  print(){ window.print(); }
  toggleOptions(){ this.showOptions = !this.showOptions; }
}
