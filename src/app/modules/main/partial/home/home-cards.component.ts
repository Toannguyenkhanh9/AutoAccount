import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

type BankRow = {
  name: string; acct: string; desc: string; cur: string;
  bal: number; od: number; avail: number; pdOut: number; pdIn: number; future: number;
};
type ArRow = { inv: string; cust: string; doc: string; due: string; days: number; amount: number; balance: number; };
type ApRow = { bill: string; supp: string; doc: string; due: string; days: number; amount: number; balance: number; };
type ReRow = { item: string; desc: string; onhand: number; reorder: number; suggest: number; };

@Component({
  selector: 'app-home-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-cards.component.html',
  styleUrls: ['./home-cards.component.scss']
})
export class HomeCardsComponent {
  // mở Bank mặc định, các card khác thu gọn
  bankCollapsed = false;
  arCollapsed = true;
  apCollapsed = true;
  reCollapsed = true;

  toggle(which: 'bank' | 'ar' | 'ap' | 're') {
    if (which === 'bank') this.bankCollapsed = !this.bankCollapsed;
    if (which === 'ar')   this.arCollapsed   = !this.arCollapsed;
    if (which === 'ap')   this.apCollapsed   = !this.apCollapsed;
    if (which === 're')   this.reCollapsed   = !this.reCollapsed;
  }

  // === DỮ LIỆU DEMO (tách từ file gốc) ===
  bankRows: BankRow[] = [
    { name:'PBB CHEQUE',  acct:'320-0000', desc:'CASH IN HAND',     cur:'MYR', bal:23633.00, od:0, avail:23633.00, pdOut:0, pdIn:0, future:23633.00 },
    { name:'CREDIT CARD', acct:'310-MBB1', desc:'MBB JALAN SULTAN', cur:'MYR', bal:30325.00, od:0, avail:30325.00, pdOut:0, pdIn:0, future:30325.00 },
    { name:'MBB CHEQUE',  acct:'310-MBB1', desc:'MBB JALAN SULTAN', cur:'MYR', bal:30325.00, od:0, avail:30325.00, pdOut:0, pdIn:0, future:30325.00 },
  ];

  arOverdue: ArRow[] = [
    { inv:'INV-000123', cust:'ABC Sdn Bhd',  doc:'2025-07-01', due:'2025-07-31', days:20, amount:1500, balance:500 },
    { inv:'INV-000124', cust:'Happy Mart',   doc:'2025-06-20', due:'2025-07-20', days:31, amount:2200, balance:2200 },
    { inv:'INV-000125', cust:'New Tech Co',  doc:'2025-07-10', due:'2025-08-10', days:10, amount: 900, balance: 300 },
  ];

  apOverdue: ApRow[] = [
    { bill:'BILL-001', supp:'XYZ Supplies', doc:'2025-06-21', due:'2025-07-21', days:30, amount:2000, balance:800 },
    { bill:'BILL-002', supp:'Paper House',  doc:'2025-07-05', due:'2025-08-05', days:15, amount:1200, balance:1200 },
  ];

  reorderAdvice: ReRow[] = [
    { item:'ITM-1001', desc:'Paper A4 80gsm', onhand:12, reorder:50, suggest:40 },
    { item:'ITM-1002', desc:'USB Flash 32GB', onhand:18, reorder:40, suggest:22 },
    { item:'ITM-1003', desc:'HP 204A Toner',  onhand: 3, reorder:10, suggest:10 },
  ];

  // Tổng Bank
  get totalBal()    { return this.bankRows.reduce((a,b)=>a+b.bal,0); }
  get totalAvail()  { return this.bankRows.reduce((a,b)=>a+b.avail,0); }
  get totalFuture() { return this.bankRows.reduce((a,b)=>a+b.future,0); }
}
