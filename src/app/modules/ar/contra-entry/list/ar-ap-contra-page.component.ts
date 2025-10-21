import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';

type Status = 'POSTED'|'DRAFT'|'VOID';

interface Party { code:string; name:string; }
interface ARDoc { docNo:string; date:string; description:string; outstanding:number; }
interface APDoc { docNo:string; date:string; description:string; outstanding:number; }

type LineType = 'AR'|'AP';
interface ContraLine {
  type: LineType;          // AR (debit) hoặc AP (credit)
  docNo: string;
  date: string;
  description: string;
  amount: number;          // số tiền knock-off cho chứng từ này
}

interface ContraEntry {
  contraNo: string;
  contraDate: string;
  party: string;           // Party code
  partyName: string;
  currency: 'MYR'|'USD'|'SGD';
  status: Status;
  narration?: string;
  totalAR: number;
  totalAP: number;
  difference: number;      // totalAR - totalAP (cần = 0)
  lines: ContraLine[];
}

@Component({
  selector: 'app-ar-ap-contra-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ar-ap-contra-page.component.html',
  styleUrls: ['./ar-ap-contra-page.component.scss']
})
export class ArApContraPageComponent {

  // ===== Masters =====
  parties: Party[] = [
    { code:'300-B001', name:'BEST PHONE SDN BHD' },
    { code:'300-C001', name:'CARE PHONE SDN BHD' },
    { code:'300-D001', name:'DOCTOR MOBILE ZONE' },
  ];

  // Open AR/AP docs theo party (demo)
  arDocsByParty: Record<string, ARDoc[]> = {
    '300-B001': [
      { docNo:'INV-0015', date:'2025-08-05', description:'Galaxy S24 Ultra', outstanding: 3999.00 },
      { docNo:'INV-0020', date:'2025-08-09', description:'Accessories',     outstanding:  120.00 },
    ],
    '300-C001': [
      { docNo:'INV-1010', date:'2025-08-02', description:'Phone case',      outstanding:   49.00 },
    ],
    '300-D001': [
      { docNo:'INV-2005', date:'2025-08-03', description:'Service fee',     outstanding:  150.00 },
    ]
  };

  apDocsByParty: Record<string, APDoc[]> = {
    '300-B001': [
      { docNo:'BILL-778', date:'2025-08-08', description:'Return charge',   outstanding: 1000.00 },
      { docNo:'BILL-781', date:'2025-08-10', description:'Claim',           outstanding:  500.00 },
    ],
    '300-C001': [
      { docNo:'BILL-820', date:'2025-08-04', description:'Promotion rebate',outstanding:   49.00 },
    ],
    '300-D001': [
      { docNo:'BILL-910', date:'2025-08-05', description:'Packaging',       outstanding:  120.00 },
    ]
  };

  // ===== Data (demo) =====
  entries: ContraEntry[] = [
    {
      contraNo:'CA-0001', contraDate:'2025-08-12',
      party:'300-B001', partyName:'BEST PHONE SDN BHD',
      currency:'MYR', status:'POSTED', narration:'Contra between AR & AP',
      totalAR: 1000, totalAP: 1000, difference: 0,
      lines:[
        { type:'AR', docNo:'INV-0020', date:'2025-08-09', description:'Accessories', amount: 1000 },
        { type:'AP', docNo:'BILL-781', date:'2025-08-10', description:'Claim',       amount: 1000 },
      ]
    }
  ];

  // ===== List / filter / paging =====
  q=''; sortBy: keyof ContraEntry='contraDate'; sortDir:'asc'|'desc'='desc';
  page=1; pageSize=8; selected?: ContraEntry;

  get filtered(){
    const s=this.q.trim().toLowerCase();
    let arr = !s ? this.entries : this.entries.filter(n =>
      n.contraNo.toLowerCase().includes(s) ||
      n.party.toLowerCase().includes(s) ||
      n.partyName.toLowerCase().includes(s) ||
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
  setSort(k:keyof ContraEntry){ if(this.sortBy===k) this.sortDir=this.sortDir==='asc'?'desc':'asc'; else{ this.sortBy=k; this.sortDir='asc'; } }
  selectRow(n:ContraEntry){ this.selected=n; }
  goFirst(){this.page=1;} goPrev(){this.page=Math.max(1,this.page-1);} goNext(){this.page=Math.min(this.totalPages,this.page+1);} goLast(){this.page=this.totalPages;}
  refresh(){ this.q=''; this.page=1; this.sortBy='contraDate'; this.sortDir='desc'; }

  // ===== Dialog / forms =====
  showForm=false; formMode:'new'|'edit'|'view'='new';
  contraForm!: FormGroup;
  get linesFA(): FormArray<FormGroup>{ return this.contraForm.get('lines') as FormArray<FormGroup>; }

  showFind=false; findForm!: FormGroup; findResults: ContraEntry[]=[];
  showPrint=false; printForm!: FormGroup; showPreview=false;

  constructor(private fb:FormBuilder){ this.buildForms(); }

  private today(){ return new Date().toISOString().slice(0,10); }
  private nextNumber(){ const seq=(this.entries.length+1).toString().padStart(4,'0'); return `CA-${seq}`; }

  buildForms(){
    this.contraForm=this.fb.group({
      contraNo: ['', Validators.required],
      contraDate: [this.today(), Validators.required],
      party: ['', Validators.required],
      partyName: [{value:'', disabled:true}],
      currency: ['MYR', Validators.required],
      status: ['POSTED' as Status, Validators.required],
      narration: [''],
      totalAR: [{value:0, disabled:true}],
      totalAP: [{value:0, disabled:true}],
      difference: [{value:0, disabled:true}],
      lines: this.fb.array<FormGroup>([])
    });

    this.findForm=this.fb.group({
      from:[''], to:[''], party:['']
    });

    this.printForm=this.fb.group({
      from:[''], to:[''], party:[''], sort:['contraDate' as keyof ContraEntry]
    });
  }

  // CRUD
  newEntry(){
    this.formMode='new';
    this.contraForm.reset({
      contraNo:this.nextNumber(),
      contraDate:this.today(),
      party:'', partyName:'',
      currency:'MYR', status:'POSTED', narration:'',
      totalAR:0, totalAP:0, difference:0
    });
    this.linesFA.clear();
    this.showForm=true;
  }
  viewEntry(){ if(!this.selected) return; this.formMode='view'; this.patch(this.selected); this.showForm=true; }
  editEntry(){ if(!this.selected) return; this.formMode='edit'; this.patch(this.selected); this.showForm=true; }
  deleteEntry(){
    if(!this.selected) return;
    if(confirm(`Delete ${this.selected.contraNo}?`)){
      this.entries=this.entries.filter(x=>x!==this.selected); this.selected=undefined;
    }
  }

  private patch(n:ContraEntry){
    this.contraForm.patchValue({
      contraNo:n.contraNo, contraDate:n.contraDate, party:n.party, partyName:n.partyName,
      currency:n.currency, status:n.status, narration:n.narration,
      totalAR:n.totalAR, totalAP:n.totalAP, difference:n.difference
    });
    this.linesFA.clear();
    n.lines.forEach(l=>this.linesFA.push(this.buildLine(l)));
  }

  saveEntry(){
    if(this.contraForm.invalid){ this.contraForm.markAllAsTouched(); return; }
    const val=this.valueFromForm();

    if(this.formMode==='new'){
      this.entries=[val, ...this.entries];
      this.selected=val;
    }else if(this.formMode==='edit' && this.selected){
      const i=this.entries.findIndex(x=>x.contraNo===this.selected!.contraNo);
      this.entries[i]=val; this.selected=val;
    }
    this.showForm=false;
  }

  // Header changes
  onPartyChanged(){
    const code=this.contraForm.get('party')!.value as string;
    const name=this.parties.find(p=>p.code===code)?.name || '';
    this.contraForm.patchValue({partyName:name},{emitEvent:false});
  }

  // Lines
  buildLine(l?:Partial<ContraLine>){
    return this.fb.group({
      type: new FormControl(l?.type ?? 'AR'),
      docNo: new FormControl(l?.docNo ?? ''),
      date: new FormControl(l?.date ?? this.today()),
      description: new FormControl(l?.description ?? ''),
      amount: new FormControl(l?.amount ?? 0),
    });
  }
  removeLine(i:number){ this.linesFA.removeAt(i); this.recalcTotals(); }

  addFromAR(doc:ARDoc){
    this.linesFA.push(this.buildLine({ type:'AR', docNo:doc.docNo, date:doc.date, description:doc.description, amount:doc.outstanding }));
    this.recalcTotals();
  }
  addFromAP(doc:APDoc){
    this.linesFA.push(this.buildLine({ type:'AP', docNo:doc.docNo, date:doc.date, description:doc.description, amount:doc.outstanding }));
    this.recalcTotals();
  }
  onAmountChanged(){ this.recalcTotals(); }

  recalcTotals(){
    const lines=this.linesFA.controls.map(f=>f.getRawValue() as ContraLine);
    const totalAR = +lines.filter(l=>l.type==='AR').reduce((s,l)=>s+(+l.amount||0),0).toFixed(2);
    const totalAP = +lines.filter(l=>l.type==='AP').reduce((s,l)=>s+(+l.amount||0),0).toFixed(2);
    const difference = +(totalAR - totalAP).toFixed(2);
    this.contraForm.patchValue({ totalAR, totalAP, difference }, {emitEvent:false});
  }

  // Auto allocate (tham khảo – đơn giản: ghép greedily)
  autoAllocate(){
    const party=this.contraForm.get('party')!.value as string;
    if(!party) return;
    this.linesFA.clear();

    const ar = (this.arDocsByParty[party]||[]).map(d=>({...d, bal:d.outstanding}));
    const ap = (this.apDocsByParty[party]||[]).map(d=>({...d, bal:d.outstanding}));

    let i=0,j=0;
    while(i<ar.length && j<ap.length){
      const take = Math.min(ar[i].bal, ap[j].bal);
      if(take<=0){ if(ar[i].bal<=0) i++; if(ap[j].bal<=0) j++; continue; }
      this.linesFA.push(this.buildLine({type:'AR', docNo:ar[i].docNo, date:ar[i].date, description:ar[i].description, amount:take}));
      this.linesFA.push(this.buildLine({type:'AP', docNo:ap[j].docNo, date:ap[j].date, description:ap[j].description, amount:take}));
      ar[i].bal -= take; ap[j].bal -= take;
      if(ar[i].bal<=0) i++; if(ap[j].bal<=0) j++;
    }
    this.recalcTotals();
  }

  private valueFromForm(): ContraEntry{
    const fv=this.contraForm.getRawValue();
    const lines:ContraLine[]=this.linesFA.controls.map(f=>f.getRawValue() as ContraLine);
    const partyName=this.parties.find(p=>p.code===fv.party)?.name || '';
    return {
      contraNo:fv.contraNo, contraDate:fv.contraDate, party:fv.party, partyName,
      currency:fv.currency, status:fv.status, narration:fv.narration,
      totalAR:+fv.totalAR, totalAP:+fv.totalAP, difference:+fv.difference, lines
    };
  }

  // Helpers to show open docs theo party
  get currentParty(): string { return this.contraForm.get('party')?.value as string; }
  get openAR(): ARDoc[] { return this.arDocsByParty[this.currentParty] || []; }
  get openAP(): APDoc[] { return this.apDocsByParty[this.currentParty] || []; }

  // Find & Print
  openFind(){ this.showFind=true; this.findResults=[]; }
  runFind(){
    const f=this.findForm.value;
    const from=f.from? new Date(f.from as string):undefined;
    const to  =f.to  ? new Date(f.to   as string):undefined;

    this.findResults=this.entries.filter(n=>{
      const dt=new Date(n.contraDate);
      const inDate=(!from||dt>=from)&&(!to||dt<=to);
      const partyHit=!f.party || n.party===f.party;
      return inDate && partyHit;
    });
  }
  pickFromFind(n:ContraEntry){ this.selected=n; this.showFind=false; }

  openPrint(){ this.showPrint=true; this.showPreview=false; }
  buildListing(): ContraEntry[]{
    const f = this.printForm.value as { from?:string; to?:string; party?:string; sort?: keyof ContraEntry };
    const from = f.from ? new Date(f.from) : undefined;
    const to   = f.to   ? new Date(f.to)   : undefined;
    const sortKey: keyof ContraEntry = (f.sort ?? 'contraDate') as keyof ContraEntry;

    return this.entries
      .filter(n=>{
        const dt=new Date(n.contraDate);
        const inDate=(!from||dt>=from)&&(!to||dt<=to);
        const partyHit=!f.party || n.party===f.party;
        return inDate && partyHit;
      })
      .sort((a,b)=>{
        const av=a[sortKey] as any;
        const bv=b[sortKey] as any;
        return String(av ?? '').localeCompare(String(bv ?? ''));
      });
  }
}
