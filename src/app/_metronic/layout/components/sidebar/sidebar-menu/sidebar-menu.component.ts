import { Component, OnInit } from '@angular/core';
import { PermissionKeys, PermissionTypes } from 'src/app/_shared/constants';
type MenuLink = { kind: 'link'; label: string; icon?: string; route: string };
type MenuSection = { kind: 'section'; label: string; icon?: string; items: MenuLink[] };
type MenuNode = MenuLink | MenuSection;
@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit {
 menu: MenuNode[] = [
    { kind: 'link', label: 'Home', icon: 'graph-4', route: '/dashboard' },
    {
      kind: 'section', label: 'Account Books', icon: 'graph-2',
      items: [
        { kind: 'link', label: 'Manage Account Book', route: 'book/manage-account-book' },
      ]
    },
    {
      kind: 'section', label: 'General Maintenance', icon: 'setting-4',
      items: [
        { kind: 'link', label: 'Company Profile', route: 'general-maintenance/company-profile' },
        { kind: 'link', label: 'Account Type Maintenance', route: 'general-maintenance/account-type-maintenance' },
        { kind: 'link', label: 'Creditor Type Maintenance', route: 'general-maintenance/creditor-type-maintenance' },
        { kind: 'link', label: 'Currency Maintenance', route: 'general-maintenance/currency-maintenance' },
        { kind: 'link', label: 'Debtor Type Maintenance', route: 'general-maintenance/debtor-type-maintenance' },
        { kind: 'link', label: 'Document Numbering Format Maintenance', route: 'general-maintenance/document-numbering-format-maintenance' },
        { kind: 'link', label: 'Journal Type Maintenance', route: 'general-maintenance/journal-type-maintenance' },
        { kind: 'link', label: 'Last Year Balance Maintenance', route: 'general-maintenance/last-year-balance-maintenance' },
      ]
    },
    {
      kind: 'section', label: 'Accounts Payable (A/P)', icon: 'wallet',
      items: [
        { kind: 'link', label: 'Creditor Maintenance', route: 'ap/creditor-maintenance' },
        { kind: 'link', label: 'Invoice Entry', route: 'ap/invoice-entry' },
        { kind: 'link', label: 'Payment', route: 'ap/payment' },
        { kind: 'link', label: 'Debit Note Entry', route: 'ap/debit-note-entry' },
        { kind: 'link', label: 'Credit Note Entry', route: 'ap/credit-note-entry' },
        { kind: 'link', label: 'Outstanding A/P Invoices Report', route: 'ap/outstanding-ap-invoice-report' },
        { kind: 'link', label: 'Creditor Aging Report', route: 'ap/creditor-aging-report' },
        { kind: 'link', label: 'Creditor Statement Report', route: 'ap/creditor-statement-report' },
      ]
    },
    {
      kind: 'section', label: 'Accounts Receivable (A/R)', icon: 'book-open',
      items: [
        { kind: 'link', label: 'Debtor Maintenance', route: 'ar/debtor-maintenance' },
        { kind: 'link', label: 'Invoice Entry', route: 'ar/invoice-entry' },
        { kind: 'link', label: 'Receive Payment', route: 'ar/receive-payment' },
        { kind: 'link', label: 'Debit Note Entry', route: 'ar/debit-note-entry' },
        { kind: 'link', label: 'Credit Note Entry', route: 'ar/credit-note-entry' },
        { kind: 'link', label: 'A/R and A/P Contra Entry', route: 'ar/ap-ar-contra-entry' },
        { kind: 'link', label: 'Outstanding A/R Invoice Report', route: 'ar/outstanding-invoice-report' },
        { kind: 'link', label: 'Debtor Aging Report', route: 'ar/debtor-aging-report' },
        { kind: 'link', label: 'Debtor Statement Report', route: 'ar/debtor-statement-report' },
        { kind: 'link', label: 'Debtor Collection Report', route: 'ar/debtor-collection-report' },
      ]
    },
    {
      kind: 'section', label: 'General Ledger (G/L)', icon: 'category',
      items: [
        { kind: 'link', label: 'Account Maintenance', route: 'gl/account-maintenance' },
        { kind: 'link', label: 'Cash Book Entry', route: 'gl/cash-book-entry' },
        { kind: 'link', label: 'Journal Entry', route: 'gl/journal-entry' },
        { kind: 'link', label: 'Opening Balance Maintenance', route: 'gl/opening-balance-maintenance' },
        { kind: 'link', label: 'Bank Reconciliation', route: 'gl/bank-reconciliation' },
        { kind: 'link', label: 'Stock Value Maintenance', route: 'gl/stock-value-maintenance' },
        { kind: 'link', label: 'View Transaction Summary', route: 'gl/view-transaction-summary' },
        { kind: 'link', label: 'Ledger Report', route: 'gl/ledger-report' },
        { kind: 'link', label: 'Journal of Transaction Report', route: 'gl/journal-of-transaction-report' },
        { kind: 'link', label: 'Trial Balance Report', route: 'gl/trial-balance-report' },
        { kind: 'link', label: 'Profit and Loss Statement', route: 'gl/profit-and-loss-statement' },
        { kind: 'link', label: 'Balance Sheet Statement', route: 'gl/balance-sheet-statement' },
        { kind: 'link', label: 'First Time Start', route: 'setup/first-time-start' },
      ]
    },
    {
      kind: 'section', label: 'Tools', icon: 'graph-3',
      items: [
        { kind: 'link', label: 'Backup', route: '/tools/backup' },
        { kind: 'link', label: 'Change Code', route: '/tools/change-code' },
        { kind: 'link', label: 'Program Control', route: '/tools/program-control' },
        { kind: 'link', label: 'Manage Fiscal Year', route: '/tools/manage-fiscal-year' },
      ]
    },

    // Ví dụ 1 mục KHÔNG có submenu:
    // { kind: 'link', label: 'Dashboard', icon: 'graph-4', route: '/dashboard' },
  ];

  // Type guards giúp template hẹp kiểu đúng, không cần (node as any)
  isSection(n: MenuNode): n is MenuSection { return (n as MenuSection).items !== undefined; }
  isLink(n: MenuNode): n is MenuLink { return (n as MenuLink).route !== undefined; } // (tuỳ dùng)

  // trackBy cần HÀM (index, item) => id
  trackByNode = (_: number, n: MenuNode) => n.label;
  trackByItem = (_: number, it: MenuLink) => it.label;

  permissionKeys = PermissionKeys;
  permissionTypes = PermissionTypes;

  constructor() {}

  ngOnInit(): void {}
}
