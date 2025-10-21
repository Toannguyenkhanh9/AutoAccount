import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
type Shortcut = { code: string; label: string };
type ReportItem = { title: string,route: string };

@Component({
  selector: 'app-customer-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-panel.component.html',
  styleUrls: ['./customer-panel.component.scss']
})
export class CustomerPanelComponent {
  constructor(private router: Router) {}
  /** Bắn event khi click 1 shortcut icon */
  @Output() openAction = new EventEmitter<Shortcut>();
  /** Bắn event khi click 1 report */
  @Output() openReport = new EventEmitter<ReportItem>();

  // Icon grid (Customer)
  shortcuts: Shortcut[] = [
    { code:'DB',  label:'Debtor' },
    { code:'INV', label:'Invoice' },
    { code:'PY',  label:'A/R Payment' },
    { code:'RF',  label:'A/R Refund' },
    { code:'CN',  label:'Credit Note' },
    { code:'DN',  label:'Debit Note' },
    { code:'DO',  label:'Delivery Order' },
    { code:'DR',  label:'Delivery Return' },
    { code:'SO',  label:'Sales Order' },
    { code:'QT',  label:'Quotation' },
    { code:'CS',  label:'Cash Sale' },
    { code:'CT',  label:'A/R & A/P Contra' },
  ];

  // Reports panel (Customer only)
  reports: ReportItem[] = [
    { title: 'Ledger Report', route: 'gl/ledger-report'},
    { title: 'Journal of Transaction Report',route: 'gl/journal-of-transaction-report' },
    { title: 'Trial Balance Report', route: 'gl/ledger-report'  },
    { title: 'Outstanding A/R Invoice Report',route: 'ar/outstanding-invoice-report' },
    { title: 'Creditor Aging Report' ,route: 'ap/creditor-aging-report'},
    { title: 'Creditor Statement Report',route: 'ap/creditor-statement-report' },
    { title: 'Outstanding A/P Invoices Report',route: 'ap/outstanding-ap-invoice-report' },
    { title: 'Debtor Aging Report', route: 'ar/debtor-aging-report'},
    { title: 'Debtor Statement Report',route: 'ar/debtor-statement-report' },
    { title: 'Debtor Collection Report',route: 'ar/debtor-collection-report' },
  ];

  onOpenShortcut(s: Shortcut) { this.openAction.emit(s); }
  onOpenReport(r: ReportItem) { if (r?.route) this.router.navigateByUrl(r.route); }
}
