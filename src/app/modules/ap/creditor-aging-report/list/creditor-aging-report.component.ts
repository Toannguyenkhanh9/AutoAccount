import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Routes } from '@angular/router';

interface Creditor {
  code: string;
  name: string;
  agent: string;
  area: string;
}

interface OpenItem {
  docNo: string;
  docDate: string;     // ISO
  dueDate: string;     // ISO
  creditorCode: string;
  creditorName: string;
  agent: string;
  area: string;
  localOutstanding: number; // dương: phải trả, âm: ghi giảm
}

interface AgingRow {
  creditorCode: string;
  creditorName: string;
  agent: string;
  area: string;
  b0_30: number;
  b31_60: number;
  b61_90: number;
  b90_plus: number;
  total: number;
}

interface GroupVM {
  key: string;
  rows: AgingRow[];
  sub0_30: number;
  sub31_60: number;
  sub61_90: number;
  sub90_plus: number;
  subTotal: number;
}

@Component({
  selector: 'app-creditor-aging-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creditor-aging-report.component.html',
  styleUrls: ['./creditor-aging-report.component.scss']
})
export class CreditorAgingReportComponent implements OnInit {

  /** Mock creditors (tham chiếu trong group/sort) */
  creditors: Creditor[] = [
    { code: 'SUP-0001', name: 'Local Marketing Sdn Bhd', agent: 'JLO', area: 'CENTRAL' },
    { code: 'SUP-0002', name: 'Best Phone Sdn Bhd',       agent: 'TEH', area: 'SOUTH'   },
    { code: 'SUP-0003', name: 'Nova Gadgets',             agent: 'AMY', area: 'EAST'    },
    { code: 'SUP-0004', name: 'P2P Marketing Sdn Bhd',    agent: 'PT',  area: 'CENTRAL' },
  ];

  /** Mock các chứng từ còn mở -> tính aging theo DueDate */
  openItems: OpenItem[] = [
    { docNo:'PINV-00001', docDate:'2025-07-01', dueDate:'2025-08-01', creditorCode:'SUP-0002', creditorName:'Best Phone Sdn Bhd',       agent:'TEH', area:'SOUTH',   localOutstanding: 1200 },
    { docNo:'PINV-00002', docDate:'2025-07-10', dueDate:'2025-08-09', creditorCode:'SUP-0001', creditorName:'Local Marketing Sdn Bhd', agent:'JLO', area:'CENTRAL', localOutstanding:  950 },
    { docNo:'PINV-00003', docDate:'2025-06-10', dueDate:'2025-07-10', creditorCode:'SUP-0003', creditorName:'Nova Gadgets',             agent:'AMY', area:'EAST',    localOutstanding: 1800 },
    { docNo:'PINV-00004', docDate:'2025-05-28', dueDate:'2025-06-27', creditorCode:'SUP-0004', creditorName:'P2P Marketing Sdn Bhd',    agent:'PT',  area:'CENTRAL', localOutstanding: 1350 },
    { docNo:'PDN-00005',  docDate:'2025-08-05', dueDate:'2025-09-04', creditorCode:'SUP-0002', creditorName:'Best Phone Sdn Bhd',       agent:'TEH', area:'SOUTH',   localOutstanding: -200 }, // ghi giảm
    { docNo:'PINV-00006', docDate:'2025-06-20', dueDate:'2025-07-20', creditorCode:'SUP-0001', creditorName:'Local Marketing Sdn Bhd', agent:'JLO', area:'CENTRAL', localOutstanding:  300 },
  ];

  // -------- Filters (khởi tạo trong ctor để tránh TS2729) ----------
  filters!: FormGroup;

  // -------- View model ----------
  showOptions = true;
  groups: GroupVM[] = [];
  grand0_30 = 0; grand31_60 = 0; grand61_90 = 0; grand90_plus = 0; grandTotal = 0;
  showPrint = false;

  constructor(private fb: FormBuilder) {
    this.filters = this.fb.group({
      asOf: ['2025-09-01'],
      creditor: [''],                 // search theo code/name
      sort: ['Creditor Code'],        // Creditor Code | Company Name | Agent | Area
      groupBy: ['None'],              // None | Agent | Area
      showCriteria: [true]
    });
  }

  ngOnInit(): void {
    this.inquiry();
  }

  // =============== Core logic ===============
  inquiry() {
    const f = this.filters.getRawValue();
    const asOf = new Date(f.asOf as string);
    const q = (f.creditor as string).trim().toLowerCase();

    // 1) Loc theo ký tự tìm kiếm
    const filtered = this.openItems.filter(it => {
      if (!q) return true;
      return it.creditorCode.toLowerCase().includes(q) || it.creditorName.toLowerCase().includes(q);
    });

    // 2) Tổng hợp theo creditor -> chia bucket
    const bucketOf = (days: number) => {
      if (days <= 30) return 0;
      if (days <= 60) return 1;
      if (days <= 90) return 2;
      return 3;
    };

    const map = new Map<string, AgingRow>();
    filtered.forEach(it => {
      const past = Math.max(0, Math.floor((asOf.getTime() - new Date(it.dueDate).getTime()) / (1000*60*60*24)));
      const idx = bucketOf(past);

      const key = it.creditorCode;
      if (!map.has(key)) {
        map.set(key, {
          creditorCode: it.creditorCode,
          creditorName: it.creditorName,
          agent: it.agent,
          area: it.area,
          b0_30: 0, b31_60: 0, b61_90: 0, b90_plus: 0, total: 0
        });
      }
      const row = map.get(key)!;
      const amt = it.localOutstanding;

      if (idx === 0) row.b0_30 += amt;
      else if (idx === 1) row.b31_60 += amt;
      else if (idx === 2) row.b61_90 += amt;
      else row.b90_plus += amt;

      row.total += amt;
    });

    // 3) To array + sort
    const rows = Array.from(map.values());
    const sortKey = f.sort as string;
    const keyGetter: Record<string, (r: AgingRow)=>string> = {
      'Creditor Code': r => r.creditorCode,
      'Company Name': r => r.creditorName,
      'Agent':        r => r.agent,
      'Area':         r => r.area
    };
    const kg = keyGetter[sortKey] ?? keyGetter['Creditor Code'];
    rows.sort((a,b)=> kg(a).localeCompare(kg(b)));

    // 4) Group
    const groups: GroupVM[] = [];
    if (f.groupBy === 'None') {
      groups.push({
        key: 'All',
        rows,
        sub0_30: sum(rows, r=>r.b0_30),
        sub31_60: sum(rows, r=>r.b31_60),
        sub61_90: sum(rows, r=>r.b61_90),
        sub90_plus: sum(rows, r=>r.b90_plus),
        subTotal: sum(rows, r=>r.total),
      });
    } else {
      const by: 'agent'|'area' = f.groupBy === 'Agent' ? 'agent' : 'area';
      const bucket = new Map<string, AgingRow[]>();
      rows.forEach(r=>{
        const k = r[by];
        if (!bucket.has(k)) bucket.set(k, []);
        bucket.get(k)!.push(r);
      });
      Array.from(bucket.entries()).sort((a,b)=> a[0].localeCompare(b[0])).forEach(([k, arr])=>{
        groups.push({
          key: k,
          rows: arr,
          sub0_30: sum(arr, r=>r.b0_30),
          sub31_60: sum(arr, r=>r.b31_60),
          sub61_90: sum(arr, r=>r.b61_90),
          sub90_plus: sum(arr, r=>r.b90_plus),
          subTotal: sum(arr, r=>r.total),
        });
      });
    }

    // 5) Grand totals
    this.groups = groups;
    this.grand0_30   = sum(groups, g=>g.sub0_30);
    this.grand31_60  = sum(groups, g=>g.sub31_60);
    this.grand61_90  = sum(groups, g=>g.sub61_90);
    this.grand90_plus= sum(groups, g=>g.sub90_plus);
    this.grandTotal  = sum(groups, g=>g.subTotal);
  }

  toggleOptions() { this.showOptions = !this.showOptions; }
  preview() { this.showPrint = true; }
  closePreview() { this.showPrint = false; }
  doPrint() { window.print(); }
}

function sum<T>(arr: T[], sel: (x:T)=>number) {
  return arr.reduce((s,x)=> s + (sel(x) || 0), 0);
}

export const AP_CREDITOR_AGING_ROUTES: Routes = [
  { path: '', component: CreditorAgingReportComponent }
];
