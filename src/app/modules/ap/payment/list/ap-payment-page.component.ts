import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type Currency = 'MYR' | 'USD';
type PvStatus = 'POSTED' | 'DRAFT';

interface Creditor {
  code: string;
  name: string;
  area: string;
  agent: string;
}

interface OpenBill {
  docNo: string;
  date: string;
  description: string;
  outstanding: number;
}

interface PaymentLine {
  docNo: string;
  date: string;
  description: string;
  outstanding: number;
  allocate: number;
}

interface ApPaymentRow {
  pvNo: string;
  date: string;
  creditorCode: string;
  creditorName: string;
  method: string;
  currency: Currency;
  amount: number;
  allocated: number;
  unallocated: number;
  status: PvStatus;
}

@Component({
  selector: 'app-ap-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ap-payment-page.component.html',
  // styleUrls: ['./ap-payment-page.component.scss']
})
export class ApPaymentPageComponent {
  creditors: Creditor[] = [
    { code:'200-B001', name:'BEST SUPPLIER SDN BHD', area:'SOUTH',   agent:'TEH' },
    { code:'200-C001', name:'CARE PARTS SDN BHD',     area:'CENTRAL', agent:'FION' },
    { code:'200-N001', name:'NOVA GADGETS',           area:'EAST',    agent:'AMY' },
  ];

  openBills: Record<string, OpenBill[]> = {
    '200-C001': [
      { docNo:'PINV-2001', date:'2025-08-05', description:'Galaxy S24 Ultra', outstanding: 3999 },
      { docNo:'PINV-2005', date:'2025-08-08', description:'Phone case',       outstanding:   49 },
    ],
    '200-B001': [
      { docNo:'PINV-1999', date:'2025-08-02', description:'Laptop parts',     outstanding: 1280 },
      { docNo:'PINV-2002', date:'2025-08-06', description:'Batteries',        outstanding:  650 },
    ],
    '200-N001': [
      { docNo:'PINV-2010', date:'2025-08-09', description:'Cables',           outstanding:  320 },
    ],
  };

  rows: ApPaymentRow[] = [
    {
      pvNo:'PV-0001', date:'2025-08-10', creditorCode:'200-C001', creditorName:'CARE PARTS SDN BHD',
      method:'Bank', currency:'MYR', amount:1500, allocated:1500, unallocated:0, status:'POSTED'
    }
  ];

  q = '';
  sortBy: keyof ApPaymentRow = 'date';
  sortAsc = false;

  page = 1; pageSize = 10;
  get filtered(): ApPaymentRow[] {
    const s = this.q.trim().toLowerCase();
    let arr = this.rows.filter(r =>
      !s || `${r.pvNo} ${r.creditorCode} ${r.creditorName} ${r.method}`.toLowerCase().includes(s)
    );
    arr = arr.sort((a:any,b:any)=>{
      const av = (a[this.sortBy] ?? '').toString().toLowerCase();
      const bv = (b[this.sortBy] ?? '').toString().toLowerCase();
      const cmp = av.localeCompare(bv, undefined, {numeric:true, sensitivity:'base'});
      return this.sortAsc ? cmp : -cmp;
    });
    return arr;
  }
  get totalPages(){ return Math.max(1, Math.ceil(this.filtered.length / this.pageSize)); }
  get paged(){ const s=(this.page-1)*this.pageSize; return this.filtered.slice(s, s+this.pageSize); }
  goto(p:number){ this.page = Math.min(Math.max(1,p), this.totalPages); }
  setSort(by: keyof ApPaymentRow){ if(this.sortBy===by) this.sortAsc=!this.sortAsc; else {this.sortBy=by; this.sortAsc=true;} }

  selected?: ApPaymentRow;

  showEdit=false; showView=false; showFind=false; showPrint=false;

  form!: FormGroup;
  lines: PaymentLine[] = [];

  constructor(
    private fb: FormBuilder,
    @Inject(DOCUMENT) private doc: Document
  ){
    this.buildForm();
  }

  private buildForm(){
    this.form = this.fb.group({
      pvNo:        ['PV-0002', Validators.required],
      date:        [this.today(), Validators.required],
      method:      ['Bank', Validators.required],
      reference:   [''],
      currency:    ['MYR' as Currency, Validators.required],
      bankCharges: [0],
      narration:   [''],
      status:      ['POSTED' as PvStatus, Validators.required],
      creditorCode:['200-C001', Validators.required],
      creditorName:['CARE PARTS SDN BHD', Validators.required],
      amount:      [1500, [Validators.required, Validators.min(0)]],
      allocated:   [0],
      unallocated: [0],
    });

    this.recalc();
  }

  private today(){ return new Date().toISOString().slice(0,10); }

  refresh(){ /* hook API */ }
  addNew(){
    this.form.reset({
      pvNo:'PV-000' + (this.rows.length+1),
      date:this.today(),
      method:'Bank',
      reference:'',
      currency:'MYR',
      bankCharges:0,
      narration:'',
      status:'POSTED',
      creditorCode:this.creditors[0].code,
      creditorName:this.creditors[0].name,
      amount:0,
      allocated:0,
      unallocated:0
    });
    this.lines = [];
    this.showEdit = true; this.selected = undefined;
  }
  edit(){ if(!this.selected) return; this.fillFromRow(this.selected); this.showEdit=true; }
  view(){ if(!this.selected) return; this.showView=true; }
  remove(){
    if(!this.selected) return;
    if(confirm(`Delete ${this.selected.pvNo}?`)){
      this.rows = this.rows.filter(r=>r!==this.selected);
      this.selected = undefined;
    }
  }
  find(){ this.showFind = true; }
  printListing(){ this.showPrint = true; }
  onPrint(){ this.doc.defaultView?.print(); }

  selectRow(r:ApPaymentRow){ this.selected = r; }

  private fillFromRow(r:ApPaymentRow){
    this.form.patchValue({
      pvNo: r.pvNo, date: r.date, method: r.method, reference:'',
      currency: r.currency, bankCharges:0, narration:'',
      status: r.status, creditorCode: r.creditorCode, creditorName: r.creditorName,
      amount: r.amount, allocated: r.allocated, unallocated: r.unallocated
    });
    this.lines = (this.openBills[r.creditorCode] || []).slice(0,1).map(b=>({
      docNo:b.docNo, date:b.date, description:b.description, outstanding:b.outstanding, allocate: Math.min(b.outstanding, r.amount)
    }));
    this.recalc();
  }

  get openBillsForForm(): OpenBill[] {
    const code = this.form.value['creditorCode'];
    return this.openBills[code] || [];
  }

  // ===== FIX: move logic from template to here
  onCreditorChange(){
    const code = this.form.value['creditorCode'];
    const c = this.creditors.find(x => x.code === code);
    this.form.patchValue({ creditorName: c?.name ?? '' });
    this.clearAlloc();
  }

  addFromOpen(b:OpenBill){
    if (this.lines.find(x=>x.docNo===b.docNo)) return;
    const remain = Math.max(0, Number(this.form.value['amount']) - this.lines.reduce((s,l)=>s+l.allocate,0));
    this.lines.unshift({
      docNo:b.docNo, date:b.date, description:b.description, outstanding:b.outstanding,
      allocate: Math.min(remain, b.outstanding)
    });
    this.recalc();
  }
  removeLine(i:number){ this.lines.splice(i,1); this.recalc(); }
  clearAlloc(){ this.lines = []; this.recalc(); }
  autoAlloc(){
    this.lines = [];
    let remain = Number(this.form.value['amount']);
    for(const b of this.openBillsForForm){
      if(remain<=0) break;
      const a = Math.min(remain, b.outstanding);
      this.lines.push({docNo:b.docNo, date:b.date, description:b.description, outstanding:b.outstanding, allocate:a});
      remain -= a;
    }
    this.recalc();
  }
  recalc(){
    const allocated = this.lines.reduce((s,l)=> s + (Number(l.allocate)||0), 0);
    const amount = Number(this.form.value['amount']) || 0;
    const unallocated = Math.max(0, amount - allocated);
    this.form.patchValue({ allocated, unallocated }, {emitEvent:false});
  }
  onAmountChange(){ this.recalc(); }
  onAllocateChange(){ this.recalc(); }

  save(){
    const f = this.form.value;
    const row: ApPaymentRow = {
      pvNo: f.pvNo, date:f.date, creditorCode:f.creditorCode, creditorName:f.creditorName,
      method:f.method, currency:f.currency, amount:Number(f.amount),
      allocated:Number(f.allocated), unallocated:Number(f.unallocated), status:f.status
    };
    if(this.selected){
      const idx = this.rows.findIndex(r=>r===this.selected);
      if(idx>-1) this.rows[idx] = row;
      this.selected = this.rows[idx];
    }else{
      this.rows = [row, ...this.rows];
      this.selected = this.rows[0];
    }
    this.showEdit = false;
  }
}
