import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type DocType = 'INV' | 'DN' | 'CN' | 'PAY'; // invoice, debit note, credit note, receive payment

interface Txn {
  debtorCode: string;
  debtorName: string;
  date: string;       // ISO yyyy-MM-dd
  docType: DocType;
  docNo: string;
  description: string;
  debit: number;      // local currency
  credit: number;     // local currency
}

interface StatementLine {
  date: string;
  docNo: string;
  description: string;
  debit: number;
  credit: number;
  balance: number; // running balance after line
}

interface Statement {
  debtorKey: string; // "code — name"
  opening: number;
  lines: StatementLine[];
  totals: { debit: number; credit: number; closing: number };
}

@Component({
  selector: 'app-debtor-statement-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './debtor-statement-report.component.html',
  styleUrls: ['./debtor-statement-report.component.scss']
})
export class DebtorStatementReportComponent {
  // ===== Sample data (local currency) =====
  txns: Txn[] = [
    // BEST PHONE SDN BHD (300-B001)
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', date:'2025-07-01', docType:'INV', docNo:'INV-0001', description:'Opening invoice', debit:2000, credit:0},
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', date:'2025-08-05', docType:'INV', docNo:'INV-0015', description:'Galaxy S24 Ultra', debit:3999, credit:0},
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', date:'2025-08-10', docType:'PAY', docNo:'RC-0008', description:'Customer payment', debit:0, credit:1500},
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', date:'2025-08-15', docType:'CN',  docNo:'CN-0003',  description:'Price discount', debit:0, credit:120},
    {debtorCode:'300-B001',debtorName:'BEST PHONE SDN BHD', date:'2025-08-28', docType:'DN',  docNo:'DN-0006',  description:'Delivery charges', debit:80, credit:0},

    // CARE PHONE SDN BHD (300-C001)
    {debtorCode:'300-C001',debtorName:'CARE PHONE SDN BHD', date:'2025-07-20', docType:'INV', docNo:'INV-0980', description:'Opening invoice', debit:500, credit:0},
    {debtorCode:'300-C001',debtorName:'CARE PHONE SDN BHD', date:'2025-08-08', docType:'INV', docNo:'INV-1010', description:'Phone case', debit:49, credit:0},
    {debtorCode:'300-C001',debtorName:'CARE PHONE SDN BHD', date:'2025-08-18', docType:'PAY', docNo:'RC-0020', description:'Full settlement', debit:0, credit:49},
  ];

  // ===== Options / filter =====
  fg: FormGroup;
  showOptions = true;
  showPreview = signal(false);

  constructor(private fb: FormBuilder){
    const start = '2025-08-01';
    const end   = '2025-08-31';
    this.fg = this.fb.group({
      dateFrom: [start],
      dateTo:   [end],
      debtor:   [''],         // filter by code or name
      includeZero: [false],
      showCriteria: [true],
      sortBy: ['date']        // date | docNo
    });
  }

  // ===== Helpers =====
  private parse(d: string){ return new Date(d+'T00:00:00'); }

  // ===== Prepared statements (grouped by debtor) =====
  statements = computed<Statement[]>(() => {
    const f = this.fg.value as any;
    const from = this.parse(f.dateFrom);
    const to   = this.parse(f.dateTo);
    const q = (f.debtor ?? '').toLowerCase();

    // group by debtor
    const map = new Map<string, Txn[]>();
    for (const t of this.txns) {
      if (q && !`${t.debtorCode} ${t.debtorName}`.toLowerCase().includes(q)) continue;
      const key = `${t.debtorCode} — ${t.debtorName}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }

    const out: Statement[] = [];
    for (const [key, list] of map.entries()) {
      // opening = sum of (debit - credit) for txns < from
      let opening = 0;
      for (const t of list) {
        const d = this.parse(t.date);
        if (d < from) opening += t.debit - t.credit;
      }

      // lines within [from..to]
      const range = list.filter(t => {
        const d = this.parse(t.date);
        return d >= from && d <= to;
      });

      // sort by selected
      const by = (f.sortBy as string) || 'date';
      range.sort((a,b)=> {
        if (by === 'docNo') return a.docNo.localeCompare(b.docNo);
        return this.parse(a.date).getTime() - this.parse(b.date).getTime();
      });

      // build running balance lines
      let bal = opening;
      const lines: StatementLine[] = [];
      for (const t of range) {
        bal += t.debit - t.credit;
        lines.push({
          date: t.date,
          docNo: t.docNo,
          description: `${t.docType} — ${t.description}`,
          debit: t.debit,
          credit: t.credit,
          balance: +bal.toFixed(2),
        });
      }

      const totalsDebit  = +range.reduce((s,x)=> s + x.debit ,0).toFixed(2);
      const totalsCredit = +range.reduce((s,x)=> s + x.credit,0).toFixed(2);
      const closing = +(opening + totalsDebit - totalsCredit).toFixed(2);

      if (!f.includeZero) {
        const hasMovement = lines.length > 0 || opening !== 0 || closing !== 0;
        if (!hasMovement) continue;
      }

      out.push({
        debtorKey: key,
        opening: +opening.toFixed(2),
        lines,
        totals: { debit: totalsDebit, credit: totalsCredit, closing }
      });
    }

    // stable order by debtor code/name
    out.sort((a,b)=> a.debtorKey.localeCompare(b.debtorKey));
    return out;
  });

  // ===== Grand totals over all debtors (period movement only) =====
  grand = computed(() => {
    const s = this.statements();
    const d = +(s.reduce((sum,x)=> sum + x.totals.debit ,0).toFixed(2));
    const c = +(s.reduce((sum,x)=> sum + x.totals.credit,0).toFixed(2));
    const open = +(s.reduce((sum,x)=> sum + x.opening,0).toFixed(2));
    const closing = +(s.reduce((sum,x)=> sum + x.totals.closing,0).toFixed(2));
    return { opening: open, debit: d, credit: c, closing };
  });

  // ===== Actions =====
  inquiry(){ this.showPreview.set(false); }
  preview(){ this.showPreview.set(true); }
  print(){ window.print(); }
  toggleOptions(){ this.showOptions = !this.showOptions; }
}
