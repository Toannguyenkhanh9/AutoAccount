import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Routes } from '@angular/router';

type Currency = 'MYR' | 'USD';

interface Creditor { code: string; name: string; agent: string; area: string; }

interface ApInvoiceRow {
  docNo: string;
  docDate: string;
  dueDate: string;
  creditorCode: string;
  creditorName: string;
  currency: Currency;
  rate: number;
  amount: number;
  localAmount: number;
  outstanding: number;
  localOutstanding: number;
  purchaseAgent: string;
  age?: number;
}

interface Group {
  key: string;
  rows: ApInvoiceRow[];
  subLocalAmount: number;
  subLocalOutstanding: number;
}

@Component({
  selector: 'app-ap-outstanding-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ap-outstanding-report.component.html',
  styleUrls: ['./ap-outstanding-report.component.scss']
})
export class ApOutstandingReportComponent implements OnInit {

  // ===== Mock data =====
  creditors: Creditor[] = [
    { code: 'SUP-0001', name: 'Local Marketing Sdn Bhd', agent: 'JLO', area: 'CENTRAL' },
    { code: 'SUP-0002', name: 'Best Phone Sdn Bhd',       agent: 'TEH', area: 'SOUTH'   },
    { code: 'SUP-0003', name: 'Nova Gadgets',             agent: 'AMY', area: 'EAST'    },
    { code: 'SUP-0004', name: 'P2P Marketing Sdn Bhd',    agent: 'PT',  area: 'CENTRAL' },
  ];

  rows: ApInvoiceRow[] = [
    { docNo:'PINV-00001', docDate:'2025-08-01', dueDate:'2025-09-01', creditorCode:'SUP-0002', creditorName:'Best Phone Sdn Bhd',       currency:'MYR', rate:1, amount:7685, localAmount:7685, outstanding:0,    localOutstanding:0,    purchaseAgent:'TEH' },
    { docNo:'PINV-00002', docDate:'2025-08-05', dueDate:'2025-09-04', creditorCode:'SUP-0001', creditorName:'Local Marketing Sdn Bhd', currency:'MYR', rate:1, amount:954,  localAmount:954,  outstanding:0,    localOutstanding:0,    purchaseAgent:'JLO' },
    { docNo:'PINV-00003', docDate:'2025-07-20', dueDate:'2025-08-19', creditorCode:'SUP-0003', creditorName:'Nova Gadgets',             currency:'MYR', rate:1, amount:2500, localAmount:2500, outstanding:1000, localOutstanding:1000, purchaseAgent:'AMY' },
    { docNo:'PINV-00004', docDate:'2025-07-28', dueDate:'2025-08-27', creditorCode:'SUP-0004', creditorName:'P2P Marketing Sdn Bhd',    currency:'MYR', rate:1, amount:1380, localAmount:1380, outstanding:1380, localOutstanding:1380, purchaseAgent:'PT'  },
    { docNo:'PDN-00005',  docDate:'2025-08-10', dueDate:'2025-09-09', creditorCode:'SUP-0002', creditorName:'Best Phone Sdn Bhd',       currency:'MYR', rate:1, amount:-200, localAmount:-200, outstanding:-200, localOutstanding:-200, purchaseAgent:'TEH' },
    { docNo:'PINV-00006', docDate:'2025-06-30', dueDate:'2025-07-30', creditorCode:'SUP-0001', creditorName:'Local Marketing Sdn Bhd', currency:'MYR', rate:1, amount:1800, localAmount:1800, outstanding:300,  localOutstanding:300,  purchaseAgent:'JLO' },
  ];

  // ===== Filters (declare then init in ctor to avoid TS2729) =====
  filters!: FormGroup;

  // ===== View model =====
  showOptions = true;
  groups: Group[] = [];
  totalLocalAmount = 0;
  totalLocalOutstanding = 0;
  showPrint = false;

  constructor(private fb: FormBuilder) {
    this.filters = this.fb.group({
      start: ['2025-06-01'],
      end:   ['2025-09-30'],
      docType: ['All'],       // All | Invoice | Debit Note
      creditor: [''],         // search text
      sort: ['Doc Date'],     // Doc No | Doc Date | Creditor Code | Company Name | Purchase Agent
      groupBy: ['None'],      // None | Creditor Code | Purchase Agent
      showCriteria: [true]
    });
  }

  ngOnInit(): void {
    this.inquiry();
  }

  inquiry() {
    const f = this.filters.getRawValue();
    const start = new Date(f.start as string);
    const end   = new Date(f.end as string);
    const txt   = (f.creditor as string).trim().toLowerCase();

    let data = this.rows.filter(r => {
      const d = new Date(r.docDate);
      if (d < start || d > end) return false;
      if (f.docType === 'Invoice'    && r.docNo.startsWith('PDN')) return false;
      if (f.docType === 'Debit Note' && r.docNo.startsWith('PINV')) return false;
      if (!txt) return true;
      return r.creditorCode.toLowerCase().includes(txt) ||
             r.creditorName.toLowerCase().includes(txt);
    }).map(r => {
      const age = Math.floor((end.getTime() - new Date(r.docDate).getTime()) / (1000*60*60*24));
      return { ...r, age: age < 0 ? 0 : age };
    });

    const keyMap: Record<string, (x:ApInvoiceRow)=>string|number> = {
      'Doc No': x => x.docNo,
      'Doc Date': x => x.docDate,
      'Creditor Code': x => x.creditorCode,
      'Company Name': x => x.creditorName,
      'Purchase Agent': x => x.purchaseAgent
    };
    const sortKey = f.sort as string;
    data = data.sort((a,b)=>{
      const ka = (keyMap[sortKey] ?? keyMap['Doc Date'])(a);
      const kb = (keyMap[sortKey] ?? keyMap['Doc Date'])(b);
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });

    const groups: Group[] = [];
    if (f.groupBy === 'None') {
      groups.push({
        key: 'All',
        rows: data,
        subLocalAmount: data.reduce((s,x)=>s+x.localAmount,0),
        subLocalOutstanding: data.reduce((s,x)=>s+x.localOutstanding,0),
      });
    } else {
      const keyGetter: Record<string, (x:ApInvoiceRow)=>string> = {
        'Creditor Code': x => `${x.creditorCode} — ${x.creditorName}`,
        'Purchase Agent': x => x.purchaseAgent
      };
      const kg = keyGetter[f.groupBy as string];
      const bucket = new Map<string, ApInvoiceRow[]>();
      data.forEach(r => {
        const k = kg(r);
        if (!bucket.has(k)) bucket.set(k, []);
        bucket.get(k)!.push(r);
      });
      bucket.forEach((rows, key) => {
        groups.push({
          key,
          rows,
          subLocalAmount: rows.reduce((s,x)=>s+x.localAmount,0),
          subLocalOutstanding: rows.reduce((s,x)=>s+x.localOutstanding,0),
        });
      });
      groups.sort((a,b)=> a.key.localeCompare(b.key));
    }

    this.groups = groups;
    this.totalLocalAmount = data.reduce((s,x)=>s+x.localAmount,0);
    this.totalLocalOutstanding = data.reduce((s,x)=>s+x.localOutstanding,0);
  }

  toggleOptions() { this.showOptions = !this.showOptions; }
  preview() { this.showPrint = true; }
  closePreview() { this.showPrint = false; }
  doPrint() { window.print(); }
}

export const AP_OUTSTANDING_ROUTES: Routes = [
  { path: '', component: ApOutstandingReportComponent }
];
