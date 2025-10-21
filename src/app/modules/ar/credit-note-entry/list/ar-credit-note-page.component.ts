import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type Status = 'POSTED'|'DRAFT'|'VOID';

interface Debtor { code:string; name:string; area?:string; }

interface CNLine {
  item: string;
  description: string;
  qty: number;
  price: number;
  taxCode: 'SR'|'ZR'|'EX';
  taxRate: number;     // %
  taxAmt: number;
  lineTotal: number;   // qty * price
}

interface CreditNote {
  cnNo: string;
  cnDate: string;
  debtor: string;        // code
  debtorName: string;
  currency: 'MYR'|'USD'|'SGD';
  reference?: string;
  status: Status;
  narration?: string;
  subTotal: number;
  taxTotal: number;
  rounding: number;
  grandTotal: number;
  lines: CNLine[];
}

@Component({
  selector: 'app-ar-credit-note-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ar-credit-note-page.component.html',
  styleUrls: ['./ar-credit-note-page.component.scss']
})
export class ArCreditNotePageComponent {
  // ===== Masters (demo) =====
  debtors: Debtor[] = [
    { code:'300-B001', name:'BEST PHONE SDN BHD', area:'SOUTH' },
    { code:'300-C001', name:'CARE PHONE SDN BHD', area:'CENTRAL' },
    { code:'300-D001', name:'DOCTOR MOBILE ZONE', area:'CENTRAL' },
  ];
  items = [
    { code:'RET-SALES',  name:'Sales Return',            price: 299 },
    { code:'DISC-GOODW', name:'Goodwill Discount',       price: 50  },
    { code:'PRICE-ADJ',  name:'Price Adjustment Credit', price: 80  },
  ];

  // ===== Data (demo) =====
  notes: CreditNote[] = [
    {
      cnNo:'CN-0001', cnDate:'2025-08-09',
      debtor:'300-B001', debtorName:'BEST PHONE SDN BHD',
      currency:'MYR', reference:'RET-INV-2015', status:'POSTED',
      narration:'Sales return – 1 unit',
      subTotal:299, taxTotal:17.94, rounding:0, grandTotal:316.94,
      lines:[
        { item:'RET-SALES', description:'Sales Return - Galaxy S24', qty:1, price:299, taxCode:'SR', taxRate:6, taxAmt:17.94, lineTotal:299 }
      ]
    },
    {
      cnNo:'CN-0002', cnDate:'2025-08-12',
      debtor:'300-C001', debtorName:'CARE PHONE SDN BHD',
      currency:'MYR', reference:'DISC-08', status:'POSTED',
      narration:'Goodwill discount',
      subTotal:50, taxTotal:0, rounding:0, grandTotal:50,
      lines:[
        { item:'DISC-GOODW', description:'Goodwill Discount', qty:1, price:50, taxCode:'EX', taxRate:0, taxAmt:0, lineTotal:50 }
      ]
    }
  ];

  // ===== List / filter / paging =====
  q=''; sortBy: keyof CreditNote='cnDate'; sortDir:'asc'|'desc'='desc';
  page=1; pageSize=8; selected?: CreditNote;

  get filtered(){
    const s=this.q.trim().toLowerCase();
    let arr = !s ? this.notes : this.notes.filter(n =>
      n.cnNo.toLowerCase().includes(s) ||
      n.debtor.toLowerCase().includes(s) ||
      n.debtorName.toLowerCase().includes(s) ||
      (n.reference??'').toLowerCase().includes(s) ||
      (n.narration??'').toLowerCase().includes(s)
    );
    arr=[...arr].sort((a,b)=>{
      const va=String(a[this.sortBy]??'').toLowerCase();
      const vb=String(b[this.sortBy]??'').toLowerCase();
      if(va<vb) return this.sortDir==='asc'?-1:1;
      if(va>vb) return this.sortDir==='asc'? 1:-1;
      return 0;
    });
    return arr;
  }
  get totalPages(){ return Math.max(1, Math.ceil(this.filtered.length/this.pageSize)); }
  get paged(){ const s=(this.page-1)*this.pageSize; return this.filtered.slice(s, s+this.pageSize); }
  setSort(k:keyof CreditNote){ if(this.sortBy===k) this.sortDir=this.sortDir==='asc'?'desc':'asc'; else{ this.sortBy=k; this.sortDir='asc'; } }
  selectRow(n:CreditNote){ this.selected=n; }
  goFirst(){this.page=1;} goPrev(){this.page=Math.max(1,this.page-1);} goNext(){this.page=Math.min(this.totalPages,this.page+1);} goLast(){this.page=this.totalPages;}
  refresh(){ this.q=''; this.page=1; this.sortBy='cnDate'; this.sortDir='desc'; }

  // ===== Dialog / forms =====
  showForm=false; formMode:'new'|'edit'|'view'='new';
  cnForm!: FormGroup;
  get linesFA(): FormArray<FormGroup>{ return this.cnForm.get('lines') as FormArray<FormGroup>; }

  showFind=false; findForm!: FormGroup; findResults: CreditNote[]=[];
  showPrint=false; printForm!: FormGroup; showPreview=false;

  constructor(private fb:FormBuilder){ this.buildForms(); }

  private today(){ return new Date().toISOString().slice(0,10); }
  private nextNumber(){ const seq=(this.notes.length+1).toString().padStart(4,'0'); return `CN-${seq}`; }

  buildForms(){
    this.cnForm=this.fb.group({
      cnNo: ['', Validators.required],
      cnDate: [this.today(), Validators.required],
      debtor: ['', Validators.required],
      debtorName: [{value:'', disabled:true}],
      currency: ['MYR', Validators.required],
      reference: [''],
      status: ['POSTED' as Status, Validators.required],
      narration: [''],
      subTotal: [{value:0, disabled:true}],
      taxTotal: [{value:0, disabled:true}],
      rounding: [0],
      grandTotal: [{value:0, disabled:true}],
      lines: this.fb.array<FormGroup>([])
    });

    this.findForm=this.fb.group({
      from:[''], to:[''], debtor:[''], min:[''], max:['']
    });

    this.printForm=this.fb.group({
      from:[''], to:[''], debtor:[''], sort:['cnDate' as keyof CreditNote]
    });
  }

  // CRUD
  newNote(){
    this.formMode='new';
    this.cnForm.reset({
      cnNo:this.nextNumber(),
      cnDate:this.today(),
      debtor:'', debtorName:'',
      currency:'MYR', reference:'',
      status:'POSTED', narration:'',
      subTotal:0, taxTotal:0, rounding:0, grandTotal:0
    });
    this.linesFA.clear();
    this.addLine();
    this.showForm=true;
  }
  viewNote(){ if(!this.selected) return; this.formMode='view'; this.patch(this.selected); this.showForm=true; }
  editNote(){ if(!this.selected) return; this.formMode='edit'; this.patch(this.selected); this.showForm=true; }
  deleteNote(){
    if(!this.selected) return;
    if(confirm(`Delete ${this.selected.cnNo}?`)){
      this.notes=this.notes.filter(x=>x!==this.selected); this.selected=undefined;
    }
  }

  private patch(n:CreditNote){
    this.cnForm.patchValue({
      cnNo:n.cnNo, cnDate:n.cnDate, debtor:n.debtor, debtorName:n.debtorName,
      currency:n.currency, reference:n.reference, status:n.status, narration:n.narration,
      subTotal:n.subTotal, taxTotal:n.taxTotal, rounding:n.rounding, grandTotal:n.grandTotal
    });
    this.linesFA.clear();
    n.lines.forEach(l=>this.linesFA.push(this.buildLine(l)));
  }

  saveNote(){
    if(this.cnForm.invalid){ this.cnForm.markAllAsTouched(); return; }
    const val=this.valueFromForm();

    if(this.formMode==='new'){
      this.notes=[val, ...this.notes];
      this.selected=val;
    }else if(this.formMode==='edit' && this.selected){
      const i=this.notes.findIndex(x=>x.cnNo===this.selected!.cnNo);
      this.notes[i]=val; this.selected=val;
    }
    this.showForm=false;
  }

  // Header changes
  onDebtorChanged(){
    const code=this.cnForm.get('debtor')!.value as string;
    const name=this.debtors.find(d=>d.code===code)?.name || '';
    this.cnForm.patchValue({debtorName:name},{emitEvent:false});
  }

  // Lines
  buildLine(l?:Partial<CNLine>){
    return this.fb.group({
      item: new FormControl(l?.item ?? ''),
      description: new FormControl(l?.description ?? ''),
      qty: new FormControl(l?.qty ?? 1, {nonNullable:true, validators:[Validators.min(0.0001)]}),
      price: new FormControl(l?.price ?? 0, {nonNullable:true}),
      taxCode: new FormControl(l?.taxCode ?? 'SR'),
      taxRate: new FormControl(l?.taxRate ?? 6),
      taxAmt: new FormControl(l?.taxAmt ?? 0),
      lineTotal: new FormControl(l?.lineTotal ?? 0),
    });
  }
  addLine(){ this.linesFA.push( this.buildLine() ); }
  removeLine(i:number){ this.linesFA.removeAt(i); this.recalcTotals(); }

  onItemChanged(i:number){
    const fg=this.linesFA.at(i) as FormGroup;
    const code=fg.get('item')!.value as string;
    const it=this.items.find(x=>x.code===code);
    if(it){
      fg.patchValue({ description: it.name, price: it.price }, {emitEvent:false});
    }
    this.onLineChanged(i);
  }
  onLineChanged(i:number){
    const fg=this.linesFA.at(i) as FormGroup;
    const qty=+fg.get('qty')!.value || 0;
    const price=+fg.get('price')!.value || 0;
    const taxCode=fg.get('taxCode')!.value as 'SR'|'ZR'|'EX';
    const taxRate = taxCode==='SR' ? (+fg.get('taxRate')!.value || 0) : 0;

    const lineTotal = +(qty*price).toFixed(2);
    const taxAmt = +((lineTotal*taxRate)/100).toFixed(2);
    fg.patchValue({ lineTotal, taxAmt, taxRate }, {emitEvent:false});
    this.recalcTotals();
  }

  recalcTotals(){
    const subTotal = +this.linesFA.controls.reduce((s,f)=> s + (+f.get('lineTotal')!.value||0), 0).toFixed(2);
    const taxTotal = +this.linesFA.controls.reduce((s,f)=> s + (+f.get('taxAmt')!.value||0), 0).toFixed(2);
    const rounding = +this.cnForm.get('rounding')!.value || 0;
    const grandTotal = +(subTotal + taxTotal + rounding).toFixed(2);
    this.cnForm.patchValue({ subTotal, taxTotal, grandTotal }, {emitEvent:false});
  }

  private valueFromForm(): CreditNote{
    const fv=this.cnForm.getRawValue();
    const lines:CNLine[]=this.linesFA.controls.map(f=>f.getRawValue() as CNLine);
    const debtorName=this.debtors.find(d=>d.code===fv.debtor)?.name || '';
    return {
      cnNo:fv.cnNo, cnDate:fv.cnDate, debtor:fv.debtor, debtorName,
      currency:fv.currency, reference:fv.reference, status:fv.status, narration:fv.narration,
      subTotal:+fv.subTotal, taxTotal:+fv.taxTotal, rounding:+fv.rounding, grandTotal:+fv.grandTotal,
      lines
    };
  }

  // Find & Print
  openFind(){ this.showFind=true; this.findResults=[]; }
  runFind(){
    const f=this.findForm.value;
    const from=f.from? new Date(f.from as string):undefined;
    const to  =f.to  ? new Date(f.to   as string):undefined;
    const min =f.min ? +f.min!:undefined;
    const max =f.max ? +f.max!:undefined;

    this.findResults=this.notes.filter(n=>{
      const dt=new Date(n.cnDate);
      const inDate=(!from||dt>=from)&&(!to||dt<=to);
      const debtorHit=!f.debtor || n.debtor===f.debtor;
      const amt=n.grandTotal;
      const amtHit=(!min||amt>=min)&&(!max||amt<=max);
      return inDate && debtorHit && amtHit;
    });
  }
  pickFromFind(n:CreditNote){ this.selected=n; this.showFind=false; }

  openPrint(){ this.showPrint=true; this.showPreview=false; }
  buildListing(): CreditNote[]{
    const f = this.printForm.value as { from?:string; to?:string; debtor?:string; sort?: keyof CreditNote };
    const from = f.from ? new Date(f.from) : undefined;
    const to   = f.to   ? new Date(f.to)   : undefined;
    const sortKey: keyof CreditNote = (f.sort ?? 'cnDate') as keyof CreditNote;

    return this.notes
      .filter(n=>{
        const dt=new Date(n.cnDate);
        const inDate=(!from||dt>=from)&&(!to||dt<=to);
        const debtorHit=!f.debtor || n.debtor===f.debtor;
        return inDate && debtorHit;
      })
      .sort((a,b)=>{
        const av=a[sortKey] as any;
        const bv=b[sortKey] as any;
        return String(av ?? '').localeCompare(String(bv ?? ''));
      });
  }
}
