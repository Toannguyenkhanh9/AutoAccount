import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../modules/main/main.routes').then((m) => m.routes),
  },
  {
    path: 'builder',
    loadChildren: () =>
      import('./builder/builder.module').then((m) => m.BuilderModule),
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
  {
    path: 'main',
    loadChildren: () =>
      import('../modules/main/main.routes').then((m) => m.routes),
  },
  {
    path: 'ar/debtor-maintenance',
    loadChildren: () =>
      import('../modules/ar/debtor-maintenance/debtor-maintenance.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ar/invoice-entry',
    loadChildren: () =>
      import('../modules/ar/invoice-entry/invoice-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ar/receive-payment',
    loadChildren: () =>
      import('../modules/ar/receive-payment/receive-payment.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ar/debit-note-entry',
    loadChildren: () =>
      import('../modules/ar/debit-note-entry/debit-note-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ar/credit-note-entry',
    loadChildren: () =>
      import('../modules/ar/credit-note-entry/credit-note-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ar/ap-ar-contra-entry',
    loadChildren: () =>
      import('../modules/ar/contra-entry/contra-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ar/outstanding-invoice-report',
    loadChildren: () =>
      import(
        '../modules/ar/outstanding-ar-invoice-report/outstanding-ar-invoice-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ar/debtor-aging-report',
    loadChildren: () =>
      import(
        '../modules/ar/debtor-aging-report/debtor-aging-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ar/debtor-statement-report',
    loadChildren: () =>
      import(
        '../modules/ar/debtor-statement-report/debtor-statement-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ar/debtor-collection-report',
    loadChildren: () =>
      import(
        '../modules/ar/debtor-collection-report/debtor-collection-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ap/creditor-maintenance',
    loadChildren: () =>
      import(
        '../modules/ap/creditor-maintenance/creditor-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ap/payment',
    loadChildren: () =>
      import('../modules/ap/payment/payment.routes').then((m) => m.routes),
  },
  {
    path: 'ap/invoice-entry',
    loadChildren: () =>
      import('../modules/ap/invoice-entry/invoice-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ap/debit-note-entry',
    loadChildren: () =>
      import('../modules/ap/debit-note-entry/debit-note-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ap/credit-note-entry',
    loadChildren: () =>
      import('../modules/ap/credit-note-entry/credit-note-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'ap/outstanding-ap-invoice-report',
    loadChildren: () =>
      import(
        '../modules/ap/outstanding-ap-invoice-report/outstanding-ap-invoice-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ap/creditor-aging-report',
    loadChildren: () =>
      import(
        '../modules/ap/creditor-aging-report/creditor-aging-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'ap/creditor-statement-report',
    loadChildren: () =>
      import(
        '../modules/ap/creditor-statement-report/creditor-statement-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'book/manage-account-book',
    loadChildren: () =>
      import(
        '../modules/book/manage-account-book/manage-account-book.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/account-maintenance',
    loadChildren: () =>
      import(
        '../modules/gl/account-maintenance/account-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/account-type-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/account-type-maintenance/account-type-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/company-profile',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/company-profile/company-profile.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/creditor-type-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/creditor-type-maintenance/creditor-type-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/currency-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/currency-maintenance/currency-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/debtor-type-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/debtor-type-maintenance/debtor-type-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/document-numbering-format-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/document-numbering-format-maintenance/document-numbering-format-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/journal-type-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/journal-type-maintenance/journal-type-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'general-maintenance/last-year-balance-maintenance',
    loadChildren: () =>
      import(
        '../modules/general-maintenance/last-year-balance-maintenance/last-year-balance-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/cash-book-entry',
    loadChildren: () =>
      import('../modules/gl/cash-book-entry/cash-book-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'gl/journal-entry',
    loadChildren: () =>
      import('../modules/gl/journal-entry/journal-entry.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'gl/opening-balance-maintenance',
    loadChildren: () =>
      import(
        '../modules/gl/opening-balance-maintenance/opening-balance-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/bank-reconciliation',
    loadChildren: () =>
      import(
        '../modules/gl/bank-reconciliation/bank-reconciliation.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/stock-value-maintenance',
    loadChildren: () =>
      import(
        '../modules/gl/stock-value-maintenance/stock-value-maintenance.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/view-transaction-summary',
    loadChildren: () =>
      import(
        '../modules/gl/view-transaction-summary/view-transaction-summary.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/ledger-report',
    loadChildren: () =>
      import('../modules/gl/ledger-report/ledger-report.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'gl/journal-of-transaction-report',
    loadChildren: () =>
      import(
        '../modules/gl/journal-of-transaction-report/journal-of-transaction-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/trial-balance-report',
    loadChildren: () =>
      import(
        '../modules/gl/trial-balance-report/trial-balance-report.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/profit-and-loss-statement',
    loadChildren: () =>
      import(
        '../modules/gl/profit-and-loss-statement/profit-and-loss-statement.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'gl/balance-sheet-statement',
    loadChildren: () =>
      import(
        '../modules/gl/balance-sheet-statement/balance-sheet-statement.routes'
      ).then((m) => m.routes),
  },
  {
    path: 'setup/first-time-start',
    loadChildren: () =>
      import(
        '../modules/auth/components/first-time-start/first-time-start.routes'
      ).then((m) => m.routes),data :{public :true}
  },
];

export { Routing };
