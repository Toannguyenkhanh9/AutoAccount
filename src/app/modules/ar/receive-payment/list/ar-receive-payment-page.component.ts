import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type Status = 'POSTED' | 'VOID';
type Method = 'Cash' | 'Bank' | 'Cheque';

interface DebtorRef { code: string; name: string; }
interface OpenInv {
  docNo: string;
  docDate: string;
  description: string;
  outstanding: number;
}

interface PayLine {
  invoiceNo: string;
  invoiceDate: string;
  description: string;
  outstandingBefore: number;
  allocate: number;
  outstandingAfter: number;
}

interface ReceivePayment {
  receiptNo: string;
  receiptDate: string;
  debtor: string;
  debtorName: string;
  method: Method;
  reference?: string;
  currency: 'MYR'|'USD'|'SGD';
  amountReceived: number;
  charges: number;
  allocated: number;
  unallocated: number;
  narration?: string;
  status: Status;
  lines: PayLine[];
}

@Component({
  selector: 'app-ar-receive-payment-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ar-receive-payment-page.component.html',
  styleUrls: ['./ar-receive-payment-page.component.scss']
})
export class ArReceivePaymentPageComponent {

  // ===== Master & sample data =====
  debtors: DebtorRef[] = [
    { code: '300-B001', name: 'BEST PHONE SDN BHD' },
    { code: '300-C001', name: 'CARE PHONE SDN BHD' },
    { code: '300-D001', name: 'DOCTOR MOBILE ZONE' },
  ];

  openByDebtor: Record<string, OpenInv[]> = {
    '300-B001': [
      { docNo:'INV-0008', docDate:'2025-07-30', description:'iPhone 14 Pro 256', outstanding: 4999.00 },
      { docNo:'INV-0011', docDate:'2025-08-04', description:'Accessory bundle', outstanding: 312.00 },
    ],
    '300-C001': [
      { docNo:'INV-0015', docDate:'2025-08-05', description:'Galaxy S24 Ultra', outstanding: 3999.00 },
      { docNo:'INV-0019', docDate:'2025-08-08', description:'Phone case', outstanding: 49.00 },
    ],
    '300-D001': [
      { docNo:'INV-0022', docDate:'2025-08-06', description:'A54 x 3', outstanding: 2697.00 },
    ]
  };

  payments: ReceivePayment[] = [
    {
      receiptNo: 'RC-0001',
      receiptDate: '2025-08-10',
      debtor: '300-C001',
      debtorName: 'CARE PHONE SDN BHD',
      method: 'Bank',
      reference: 'TT-897223',
      currency: 'MYR',
      amountReceived: 1500.00,
      charges: 0,
      allocated: 1500.00,
      unallocated: 0.00,
      narration: 'Part payment',
      status: 'POSTED',
      lines: [
        { invoiceNo:'INV-0015', invoiceDate:'2025-08-05', description:'Galaxy S24 Ultra', outstandingBefore: 3999.00, allocate: 1500.00, outstandingAfter: 2499.00 }
      ]
    }
  ];

  // ===== List / paging =====
  selected?: ReceivePayment;
  q=''; sortBy: keyof ReceivePayment='receiptDate'; sortDir:'asc'|'desc'='desc';
  page=1; pageSize=8;

  get filtered(){
    const s=this.q.trim().toLowerCase();
    let list = !s ? this.payments : this.payments.filter(p =>
      p.receiptNo.toLowerCase().includes(s) ||
      p.debtor.toLowerCase().includes(s) ||
      p.debtorName.toLowerCase().includes(s) ||
      (p.reference ?? '').toLowerCase().includes(s) ||
      (p.narration ?? '').toLowerCase().includes(s)
    );
    list=[...list].sort((a,b)=>{
      const va=String(a[this.sortBy]??'').toLowerCase();
      const vb=String(b[this.sortBy]??'').toLowerCase();
      if(va<vb) return this.sortDir==='asc'?-1:1;
      if(va>vb) return this.sortDir==='asc'? 1:-1;
      return 0;
    });
    return list;
  }
  get totalPages(){ return Math.max(1, Math.ceil(this.filtered.length/this.pageSize)); }
  get paged(){ const s=(this.page-1)*this.pageSize; return this.filtered.slice(s,s+this.pageSize); }
  setSort(k:keyof ReceivePayment){ if(this.sortBy===k) this.sortDir=this.sortDir==='asc'?'desc':'asc'; else{this.sortBy=k; this.sortDir='asc';} }
  selectRow(p:ReceivePayment){ this.selected=p; }
  goFirst(){this.page=1;} goPrev(){this.page=Math.max(1,this.page-1);} goNext(){this.page=Math.min(this.totalPages,this.page+1);} goLast(){this.page=this.totalPages;}
  refresh(){ this.q=''; this.page=1; this.sortBy='receiptDate'; this.sortDir='desc'; }

  // ===== Forms / dialogs =====
  showForm=false; formMode:'new'|'edit'|'view'='new';
  payForm!: FormGroup;
  get linesFA(): FormArray<FormGroup>{ return this.payForm.get('lines') as FormArray<FormGroup>; }

  showFind=false; findForm!: FormGroup; findResults: ReceivePayment[]=[];
  showPrint=false; printForm!: FormGroup; showPreview=false;
  showOR=false; // official receipt preview

  constructor(private fb:FormBuilder){ this.buildForms(); }

  private today(){ return new Date().toISOString().slice(0,10); }
  private nextNumber(){ const seq=(this.payments.length+1).toString().padStart(4,'0'); return `RC-${seq}`; }

  buildForms(){
    this.payForm=this.fb.group({
      receiptNo: ['', Validators.required],
      receiptDate: [this.today(), Validators.required],
      debtor: ['', Validators.required],
      debtorName: [{value:'', disabled:true}],
      method: ['Cash' as Method, Validators.required],
      reference: [''],
      currency: ['MYR', Validators.required],
      amountReceived: [0, [Validators.required, Validators.min(0)]],
      charges: [0, [Validators.min(0)]],
      allocated: [{value:0, disabled:true}],
      unallocated: [{value:0, disabled:true}],
      narration: [''],
      status: ['POSTED' as Status],
      lines: this.fb.array<FormGroup>([])
    });

    this.findForm=this.fb.group({
      from:[''], to:[''], debtor:[''], method:[''], min:[''], max:['']
    });

    this.printForm=this.fb.group({
      from:[''], to:[''], debtor:[''], method:[''], sort:['receiptDate' as keyof ReceivePayment]
    });
  }

  // ===== CRUD =====
  newPayment(){
    this.formMode='new';
    this.payForm.reset({
      receiptNo: this.nextNumber(),
      receiptDate: this.today(),
      debtor: '', debtorName:'',
      method: 'Cash', reference:'',
      currency: 'MYR',
      amountReceived: 0, charges: 0,
      allocated: 0, unallocated: 0,
      narration: '', status: 'POSTED'
    });
    this.linesFA.clear();
    this.showForm=true;
  }
  viewPayment(){ if(!this.selected) return; this.formMode='view'; this.patchPayment(this.selected); this.showForm=true; }
  editPayment(){ if(!this.selected) return; this.formMode='edit'; this.patchPayment(this.selected); this.showForm=true; }
  deletePayment(){
    if(!this.selected) return;
    if(confirm(`Delete ${this.selected.receiptNo}?`)){
      this.payments=this.payments.filter(p=>p!==this.selected);
      this.selected=undefined;
    }
  }

  private patchPayment(p:ReceivePayment){
    this.payForm.patchValue({
      receiptNo:p.receiptNo, receiptDate:p.receiptDate,
      debtor:p.debtor, debtorName:p.debtorName,
      method:p.method, reference:p.reference,
      currency:p.currency, amountReceived:p.amountReceived,
      charges:p.charges, allocated:p.allocated, unallocated:p.unallocated,
      narration:p.narration, status:p.status
    });
    this.linesFA.clear();
    p.lines.forEach(l=>this.linesFA.push(this.buildLineFG(l)));
  }

  savePayment(){
    if(this.payForm.invalid){ this.payForm.markAllAsTouched(); return; }
    const val=this.valueFromForm();

    if(val.allocated + val.charges > val.amountReceived + 1e-6){
      alert('Allocated + Charges cannot exceed Amount Received.'); return;
    }
    if(val.lines.some(l => l.allocate < 0 || l.allocate > l.outstandingBefore + 1e-6)){
      alert('Allocation must be between 0 and invoice outstanding.'); return;
    }

    if(this.formMode==='new'){
      this.payments=[val, ...this.payments];
      this.selected=val;
      this.applyKnockOff(val);
    }else if(this.formMode==='edit' && this.selected){
      const idx=this.payments.findIndex(x=>x.receiptNo===this.selected!.receiptNo);
      this.payments[idx]=val; this.selected=val;
    }
    this.showForm=false;
  }

  private applyKnockOff(p:ReceivePayment){
    const arr=this.openByDebtor[p.debtor] ?? [];
    p.lines.forEach(l=>{
      const inv=arr.find(x=>x.docNo===l.invoiceNo);
      if(inv){ inv.outstanding=+(inv.outstanding - l.allocate).toFixed(2); if(inv.outstanding<0) inv.outstanding=0; }
    });
    this.openByDebtor[p.debtor]=arr.filter(x=>x.outstanding>0.005);
  }

  private valueFromForm(): ReceivePayment{
    const fv=this.payForm.getRawValue();
    const lines:PayLine[]=this.linesFA.controls.map(f=>f.getRawValue() as PayLine);
    const allocated=+lines.reduce((s,l)=>s+l.allocate,0).toFixed(2);
    const unallocated=+(+fv.amountReceived - allocated - +fv.charges).toFixed(2);
    const debtorName=this.debtors.find(d=>d.code===fv.debtor)?.name || '';
    return {
      receiptNo: fv.receiptNo, receiptDate: fv.receiptDate,
      debtor: fv.debtor, debtorName,
      method: fv.method, reference: fv.reference,
      currency: fv.currency,
      amountReceived: +fv.amountReceived, charges: +fv.charges,
      allocated, unallocated,
      narration: fv.narration, status: fv.status,
      lines
    };
  }

  // ===== Header & debtor change =====
  onDebtorChanged(){
    const code=this.payForm.get('debtor')!.value as string;
    const name=this.debtors.find(d=>d.code===code)?.name || '';
    this.payForm.patchValue({debtorName:name},{emitEvent:false});
    this.linesFA.clear(); this.recalcTotals();
  }
  onHeaderChanged(){ this.recalcTotals(); }

  // ===== Lines & helpers =====
  buildLineFG(l?:Partial<PayLine>){
    return this.fb.group({
      invoiceNo: new FormControl(l?.invoiceNo ?? ''),
      invoiceDate: new FormControl(l?.invoiceDate ?? ''),
      description: new FormControl(l?.description ?? ''),
      outstandingBefore: new FormControl(l?.outstandingBefore ?? 0),
      allocate: new FormControl(l?.allocate ?? 0, {nonNullable:true, validators:[Validators.min(0)]}),
      outstandingAfter: new FormControl(l?.outstandingAfter ?? 0),
    });
  }
  addFromOpen(inv:OpenInv){
    const remain=this.remainingToAllocate();
    const allocate=+Math.min(remain, inv.outstanding).toFixed(2);
    const fg=this.buildLineFG({
      invoiceNo:inv.docNo, invoiceDate:inv.docDate,
      description:inv.description, outstandingBefore:inv.outstanding,
      allocate, outstandingAfter:+(inv.outstanding - allocate).toFixed(2)
    });
    this.linesFA.push(fg); this.recalcTotals();
  }
  autoLoadAll(){
    const code=this.payForm.get('debtor')!.value as string;
    if(!code) return;
    const opens=(this.openByDebtor[code] ?? []).slice().sort((a,b)=>a.docDate.localeCompare(b.docDate));
    opens.forEach(x=>{
      if(!this.linesFA.controls.some(f=>f.get('invoiceNo')!.value===x.docNo)){
        this.addFromOpen(x);
      }
    });
  }
  clearAllocations(){ this.linesFA.clear(); this.recalcTotals(); }

  removeLine(i:number){ this.linesFA.removeAt(i); this.recalcTotals(); }
  onLineChanged(i:number){
    const fg=this.linesFA.at(i) as FormGroup;
    const before=+fg.get('outstandingBefore')!.value || 0;
    let alloc=+fg.get('allocate')!.value || 0;
    if(alloc<0) alloc=0; if(alloc>before) alloc=before;
    fg.patchValue({ allocate:alloc, outstandingAfter:+(before-alloc).toFixed(2) }, {emitEvent:false});
    this.recalcTotals();
  }

  remainingToAllocate(){
    const amount=+this.payForm.get('amountReceived')!.value || 0;
    const charges=+this.payForm.get('charges')!.value || 0;
    const allocated=+this.linesFA.controls.reduce((s,f)=> s + (+f.get('allocate')!.value || 0), 0).toFixed(2);
    return +(amount - charges - allocated).toFixed(2);
  }
  recalcTotals(){
    const allocated=+this.linesFA.controls.reduce((s,f)=> s + (+f.get('allocate')!.value || 0), 0).toFixed(2);
    const amount=+this.payForm.get('amountReceived')!.value || 0;
    const charges=+this.payForm.get('charges')!.value || 0;
    const unallocated=+(amount - charges - allocated).toFixed(2);
    this.payForm.patchValue({allocated, unallocated},{emitEvent:false});
  }

  // ===== Auto Allocate =====
  autoAllocate(){
    const code=this.payForm.get('debtor')!.value as string;
    if(!code) return;
    const opens=(this.openByDebtor[code] ?? []).slice().sort((a,b)=>a.docDate.localeCompare(b.docDate));
    // Ensure we have all open invoices in lines (no dup)
    opens.forEach(x=>{
      if(!this.linesFA.controls.some(f=>f.get('invoiceNo')!.value===x.docNo)){
        this.linesFA.push(this.buildLineFG({
          invoiceNo:x.docNo, invoiceDate:x.docDate, description:x.description,
          outstandingBefore:x.outstanding, allocate:0, outstandingAfter:x.outstanding
        }));
      }
    });
    // Distribute remaining
    let remain=this.remainingToAllocate();
    for(const fg of this.linesFA.controls){
      if(remain<=0) break;
      const before=+fg.get('outstandingBefore')!.value || 0;
      const cur=+fg.get('allocate')!.value || 0;
      const can=before - cur;
      const put=Math.min(can, remain);
      const newAlloc=+(cur + put).toFixed(2);
      fg.patchValue({ allocate:newAlloc, outstandingAfter:+(before - newAlloc).toFixed(2) }, {emitEvent:false});
      remain=+(remain - put).toFixed(2);
    }
    this.recalcTotals();
  }

  // ===== Find / Print =====
  openFind(){ this.showFind=true; this.findResults=[]; }
  runFind(){
    const f=this.findForm.value;
    const from=f.from ? new Date(f.from as string):undefined;
    const to  =f.to   ? new Date(f.to   as string):undefined;
    const min =f.min ? +f.min!:undefined;
    const max =f.max ? +f.max!:undefined;
    this.findResults=this.payments.filter(p=>{
      const dt=new Date(p.receiptDate);
      const inDate=(!from || dt>=from) && (!to || dt<=to);
      const debtHit=!f.debtor || p.debtor===f.debtor;
      const methodHit=!f.method || p.method===f.method;
      const amt=p.amountReceived;
      const amtHit=(!min || amt>=min) && (!max || amt<=max);
      return inDate && debtHit && methodHit && amtHit;
    });
  }
  pickFromFind(p:ReceivePayment){ this.selected=p; this.showFind=false; }

  openPrint(){ this.showPrint=true; this.showPreview=false; }
  buildListing(): ReceivePayment[]{
    const f=this.printForm.value;
    const from=f.from ? new Date(f.from as string):undefined;
    const to  =f.to   ? new Date(f.to   as string):undefined;
    const method=f.method as Method|''|undefined;
    const sortKey=(f.sort ?? 'receiptDate') as keyof ReceivePayment;
    return this.payments
      .filter(p=>{
        const dt=new Date(p.receiptDate);
        const inDate=(!from || dt>=from) && (!to || dt<=to);
        const debtHit=!f.debtor || p.debtor===f.debtor;
        const methodHit=!method || p.method===method;
        return inDate && debtHit && methodHit;
      })
      .sort((a,b)=> String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? '')));
  }

  // ===== Official Receipt Preview =====
  openOR(){ this.showOR=true; }
  closeOR(){ this.showOR=false; }
}
