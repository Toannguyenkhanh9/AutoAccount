import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';

type AccKind = 'type' | 'normal' | 'special';

interface FixedLinkRow {
  assetId: string;
  assetCode: string;
  assetDesc: string;
  deprId: string;
  deprCode: string;
  deprDesc: string;
}

interface AccountNode {
  id: string;
  kind: AccKind;
  code?: string;
  desc: string;
  specialCode?: string;
  currency?: string;
  balance?: number;
  canCarryChildren?: boolean;
  hasTxn?: boolean;
  parentId?: string | null;
  expanded?: boolean;
  children?: AccountNode[];
}

interface FlatRow {
  node: AccountNode;
  depth: number;
  visible: boolean;
}

interface PaymentMethod {
  name: string;
  journalType: 'BANK' | 'CASH' | 'DEPOSIT';
  bankChargeAcc?: string;
  bankChargeRate?: number;
  paymentBy?: string;
  paymentType?: 'Cash' | 'Credit Card' | 'Multi' | 'Other';
  requireExtraInfo?: boolean;
  mergeBankCharge?: boolean;
  pvFormat?: string;
  orFormat?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-account-maintenance',
  templateUrl: './account-maintenance.component.html',
  styleUrls: ['./account-maintenance.component.scss'],
})
export class AccountMaintenanceComponent {
  currencies: string[] = ['MYR', 'USD', 'SGD', 'IDR', 'THB', 'VND', 'CNY', 'JPY', 'EUR'];

  selectedType = 'ALL';
  upToDate = this.toISO(new Date());
  findText = '';
  private findHits: FlatRow[] = [];
  private findIndex = -1;

  // hàng đang chọn trong grid
  selectedNodeId: string | null = null;

  ui = {
    newNormalOpen: false,
    fixedAssetOpen: false,
    bankCashOpen: false,
    debtorCtrlOpen: false,
    creditorCtrlOpen: false,
    stockOpen: false,
    retainedOpen: false,
    editOpen: false,
    fixedLinksOpen: false,
  };

  newNormal = {
    parentId: '' as string | null,
    code: '',
    desc: '',
    currency: 'MYR',
    cashflow: 'Operating Activities',
  };

  // Fixed Asset (2 phần)
  fixedAsset = {
    parentId: '' as string | null,
    currency: 'MYR',
    cashflow: 'Investing Activities',
    assetCode: '',
    assetDesc: '',
    assetDesc2: '',
    deprCode: '',
    deprDesc: '',
    deprDesc2: '',
  };

  bankCash = {
    parentId: '' as string | null,
    mode: 'Bank' as 'Bank' | 'Cash' | 'Deposit',
    underType: 'Current Assets' as 'Current Assets' | 'Current Liabilities',
    code: '',
    desc: '',
    currency: 'MYR',
    cashflow: 'Operating Activities',
    odLimit: 0,
    methods: [] as PaymentMethod[],
    newMethod: {
      name: 'CHEQUE',
      journalType: 'BANK' as PaymentMethod['journalType'],
      bankChargeAcc: '',
      bankChargeRate: 0,
      paymentBy: 'CHEQUE',
      paymentType: 'Cash' as PaymentMethod['paymentType'],
      requireExtraInfo: true,
      mergeBankCharge: true,
      pvFormat: 'PV Default',
      orFormat: 'ORB',
    } as PaymentMethod,
  };

  debtorCtrl = { parentId: '' as string | null, code: '', desc: '' };
  creditorCtrl = { parentId: '' as string | null, code: '', desc: '' };
  stock = {
    parentIdOpenClose: '' as string | null,
    parentIdBalance: '' as string | null,
    openCode: '',
    closeCode: '',
    balCode: '',
    currency: 'MYR',
  };
  retained = { parentId: '' as string | null, code: '', desc: 'RETAINED EARNING' };

  edit = { nodeId: '' as string, parentId: '' as string | null, code: '', desc: '', currency: 'MYR' };

  // ===== mock data =====
  roots: AccountNode[] = [
    {
      id: 'T-CAP',
      kind: 'type',
      desc: 'CAPITAL',
      expanded: true,
      children: [
        {
          id: 'N-SHARE',
          kind: 'normal',
          code: '100-0000',
          desc: 'SHARE CAPITAL',
          currency: 'MYR',
          balance: -200000,
          canCarryChildren: true,
          children: [],
        },
      ],
    },
    {
      id: 'T-RE',
      kind: 'type',
      desc: 'RETAINED EARNING',
      expanded: true,
      children: [
        {
          id: 'S-RE',
          kind: 'special',
          code: '150-0000',
          desc: 'RETAINED EARNING',
          specialCode: 'SRE',
          currency: 'MYR',
          balance: -78800,
          canCarryChildren: false,
          children: [],
        },
        { id: 'N-RES', kind: 'normal', code: '151-0000', desc: 'RESERVES', canCarryChildren: true, children: [] },
      ],
    },
    {
      id: 'T-FA',
      kind: 'type',
      desc: 'FIXED ASSETS',
      expanded: true,
      children: [
        {
          id: 'FA-MOTOR',
          kind: 'special',
          code: '200-1000',
          desc: 'MOTOR VEHICLES',
          specialCode: 'SAD',
          currency: 'MYR',
          balance: 70000,
          canCarryChildren: false,
          children: [],
        },
        {
          id: 'FA-DEP-MOTOR',
          kind: 'special',
          code: '200-1005',
          desc: 'ACCUM. DEPRN. MOTOR VEHICLES',
          specialCode: 'SFA',
          currency: 'MYR',
          balance: -14000,
        },
        {
          id: 'FA-FFE',
          kind: 'special',
          code: '200-2000',
          desc: 'FURNITURES & FITTINGS',
          specialCode: 'SAD',
          currency: 'MYR',
          balance: 50000,
          canCarryChildren: false,
          children: [],
        },
        {
          id: 'FA-DEP-FFE',
          kind: 'special',
          code: '200-2005',
          desc: 'ACCUM. DEPRN. - FURNITURES & FITTINGS',
          specialCode: 'SFA',
          currency: 'MYR',
          balance: -10000,
        },
        {
          id: 'FA-OFFICE',
          kind: 'special',
          code: '200-3000',
          desc: 'OFFICE EQUIPMENT',
          specialCode: 'SAD',
          currency: 'MYR',
          balance: 19500,
          canCarryChildren: false,
          children: [],
        },
        {
          id: 'FA-DEP-OFFICE',
          kind: 'special',
          code: '200-3005',
          desc: 'ACCUM. DEPRN. - OFFICE EQUIPMENT',
          specialCode: 'SFA',
          currency: 'MYR',
          balance: -4000,
        },
      ],
    },
    {
      id: 'T-CA',
      kind: 'type',
      desc: 'CURRENT ASSETS',
      expanded: true,
      children: [
        { id: 'S-TRADE-DEBTORS', kind: 'special', code: '300-0000', desc: 'TRADE DEBTORS', specialCode: 'SDC', currency: 'MYR', balance: 68949, canCarryChildren: false },
        { id: 'S-OTHER-DEBTORS', kind: 'special', code: '301-0000', desc: 'OTHER DEBTORS', specialCode: 'SDC', currency: 'MYR', balance: 0 },
        {
          id: 'N-BANKS',
          kind: 'normal',
          code: '310-0000',
          desc: 'CASH AT BANK',
          canCarryChildren: true,
          children: [
            { id: 'S-MBB', kind: 'special', code: '310-MBB1', desc: 'MBB JALAN SULTAN', specialCode: 'SBK', currency: 'MYR', balance: 30000 },
            { id: 'S-FBB', kind: 'special', code: '310-FBB1', desc: 'FBB CHERAS', specialCode: 'SBK', currency: 'MYR', balance: 25000 },
          ],
        },
        { id: 'S-CASH-HAND', kind: 'special', code: '320-0000', desc: 'CASH IN HAND', specialCode: 'SCH', currency: 'MYR', balance: 20000 },
        { id: 'S-STOCK', kind: 'special', code: '330-0000', desc: 'STOCK', specialCode: 'SCS', currency: 'MYR', balance: 2000 },
        { id: 'S-PREPAY', kind: 'special', code: '340-0000', desc: 'PREPAYMENT', specialCode: 'SCS', currency: 'MYR', balance: 0 },
        { id: 'S-DEPOSIT-PAID', kind: 'special', code: '350-0000', desc: 'DEPOSIT PAID', specialCode: 'SCS', currency: 'MYR', balance: 0 },
      ],
    },
  ];

  // ===== derived =====
  get accountTypes(): { id: string; label: string }[] {
    return [{ id: 'ALL', label: 'Show All' }, ...this.roots.map((r) => ({ id: r.id, label: r.desc }))];
  }

  // ===== utils =====
  private toISO(d: Date) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }

  private genId(prefix: 'N' | 'S' = 'N'): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  // ===== tree flatten =====
  toggle(node: AccountNode) {
    node.expanded = !node.expanded;
  }

  get flat(): FlatRow[] {
    const rows: FlatRow[] = [];
    const acceptRoot = (root: AccountNode) => this.selectedType === 'ALL' || root.id === this.selectedType;
    for (const root of this.roots) {
      if (!acceptRoot(root)) continue;
      this.walk(root, 0, rows);
    }
    return rows;
  }

  private walk(node: AccountNode, depth: number, out: FlatRow[]) {
    out.push({ node, depth, visible: true });
    if (!node.children || !node.expanded) return;
    for (const ch of node.children) this.walk(ch, depth + 1, out);
  }

  // ===== select row =====
  onRowSelect(r: FlatRow) {
    this.selectedNodeId = r.node.id;
  }

  // ancestry helpers
  private getAncestry(id: string): AccountNode[] {
    const path: AccountNode[] = [];
    const dfs = (n: AccountNode, stack: AccountNode[]): boolean => {
      const cur = [...stack, n];
      if (n.id === id) {
        path.push(...cur);
        return true;
      }
      if (n.children) for (const c of n.children) if (dfs(c, cur)) return true;
      return false;
    };
    for (const r of this.roots) if (dfs(r, [])) break;
    return path;
  }
  private findParentId(childId: string): string | null {
    const anc = this.getAncestry(childId);
    return anc.length >= 2 ? anc[anc.length - 2].id : null;
  }
  private defaultParentFromSelection(preferTypeDesc?: string): string | null {
    if (preferTypeDesc) {
      const t = this.roots.find((r) => r.desc === preferTypeDesc);
      if (t) return t.id;
    }
    if (!this.selectedNodeId) return null;
    const anc = this.getAncestry(this.selectedNodeId);
    // cấp 3 ⇒ lấy parent cấp 2; cấp 1/2 ⇒ chính nó
    if (anc.length >= 3) return anc[anc.length - 2].id;
    return anc[anc.length - 1].id;
  }
  private moveNode(childId: string, newParentId: string) {
    if (childId === newParentId) return;
    // remove from current parent
    const removeFrom = (arr: AccountNode[]): AccountNode | null => {
      for (let i = 0; i < arr.length; i++) {
        const n = arr[i];
        if (n.id === childId) {
          arr.splice(i, 1);
          return n;
        }
        if (n.children) {
          const got = removeFrom(n.children);
          if (got) return got;
        }
      }
      return null;
    };
    const node = removeFrom(this.roots);
    if (!node) return;
    const parent = this.getNode(newParentId);
    if (!parent) return;
    parent.children = parent.children ?? [];
    parent.children.push(node);
    parent.expanded = true;
  }

  // ===== search =====
  doFind() {
    this.findHits = [];
    this.findIndex = -1;
    if (!this.findText.trim()) return;
    const q = this.findText.toLowerCase();
    for (const r of this.flat) {
      const s = (r.node.desc + ' ' + (r.node.code ?? '')).toLowerCase();
      if (s.includes(q)) this.findHits.push(r);
    }
    this.findNext();
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'F3') {
      e.preventDefault();
      this.findNext();
    }
  }

  findNext() {
    if (this.findHits.length === 0) return;
    this.findIndex = (this.findIndex + 1) % this.findHits.length;
    const target = this.findHits[this.findIndex].node;
    // expand ancestors
    const anc = this.getAncestry(target.id);
    anc.forEach((a) => (a.expanded = true));
    setTimeout(() => {
      const el = document.getElementById(`row-${target.id}`);
      el?.scrollIntoView({ block: 'center' });
      el?.classList.add('hit');
      setTimeout(() => el?.classList.remove('hit'), 800);
    });
  }

  // node access
  allNodes(): AccountNode[] {
    const list: AccountNode[] = [];
    const dfs = (n: AccountNode) => {
      list.push(n);
      n.children?.forEach(dfs);
    };
    this.roots.forEach(dfs);
    return list;
  }
  getNode(id: string) {
    return this.allNodes().find((n) => n.id === id);
  }
  getParents(): AccountNode[] {
    return this.allNodes().filter((n) => n.kind === 'normal' && !!n.canCarryChildren);
  }
  getTypesOnly(): AccountNode[] {
    return this.roots;
  }

  // ===== New Normal =====
  openNewNormal(parentId?: string) {
    this.ui.newNormalOpen = true;
    this.newNormal = {
      parentId: parentId ?? this.defaultParentFromSelection() ?? this.roots[0]?.id ?? null,
      code: '',
      desc: '',
      currency: 'MYR',
      cashflow: 'Operating Activities',
    };
  }
  saveNewNormal() {
    if (!this.newNormal.parentId) {
      alert('Select Parent Account/Type.');
      return;
    }
    const parent = this.getNode(this.newNormal.parentId)!;
    const node: AccountNode = {
      id: this.genId('N'),
      kind: 'normal',
      code: this.newNormal.code.trim(),
      desc: this.newNormal.desc.trim(),
      currency: this.newNormal.currency,
      balance: 0,
      canCarryChildren: true,
      children: [],
    };
    parent.children = parent.children ?? [];
    parent.children.push(node);
    parent.expanded = true;
    this.ui.newNormalOpen = false;
  }

  // ===== Fixed Asset (pair) =====
  onFixedAssetNameChange(name: string) {
    this.fixedAsset.deprDesc = `ACCUM. DEPRN. - ${String(name || '').toUpperCase()}`;
  }

  openFixedAsset() {
    const faType = this.roots.find((r) => r.desc === 'FIXED ASSETS');
    this.fixedAsset = {
      parentId: faType?.id ?? null,
      assetCode: '',
      assetDesc: '',
      deprCode: '',
      currency: 'MYR',
      cashflow: 'Investing Activities',
      assetDesc2: '',
      deprDesc: '',
      deprDesc2: '',
    };
    this.ui.fixedLinksOpen = false;
    this.ui.fixedAssetOpen = true;
  }

  /** Tạo 2 tài khoản: Asset (SAD) + Accum Deprn (SFA) và đưa vào danh sách links */
  saveFixedAsset() {
    if (!this.fixedAsset.parentId) {
      alert('Select parent (<<FIXED ASSETS>>).');
      return;
    }
    const parent = this.getNode(this.fixedAsset.parentId)!;
    parent.children = parent.children ?? [];

    // 1) Asset A/C (SAD)
    const assetNode: AccountNode = {
      id: this.genId('S'),
      kind: 'special',
      code: this.fixedAsset.assetCode,
      desc: this.fixedAsset.assetDesc,
      specialCode: 'SAD',
      currency: this.fixedAsset.currency,
      canCarryChildren: false,
      balance: 0,
      children: [],
    };

    // 2) Accum Deprn A/C (SFA)
    const deprNode: AccountNode = {
      id: this.genId('S'),
      kind: 'special',
      code: this.fixedAsset.deprCode,
      desc: `ACCUM. DEPRN. - ${this.fixedAsset.assetDesc.toUpperCase()}`,
      specialCode: 'SFA',
      currency: this.fixedAsset.currency,
      canCarryChildren: false,
      balance: 0,
      children: [],
    };

    parent.children.push(assetNode, deprNode);
    parent.expanded = true;

    // thêm vào bảng Fixed Asset Links (hiển thị ngay dòng 1 + dòng 2)
    this.fixedLinks.unshift({
      assetId: assetNode.id,
      assetCode: assetNode.code || '',
      assetDesc: assetNode.desc,
      deprId: deprNode.id,
      deprCode: deprNode.code || '',
      deprDesc: deprNode.desc,
    });

    this.ui.fixedAssetOpen = false;
  }

  // Popup Maintain Fixed Asset Links
  openFixedLinks() {
    this.ui.fixedLinksOpen = true;
  }
  addFixedFromLinks() {
    // mở lại form tạo Fixed Asset
    this.ui.fixedLinksOpen = false;
    this.openFixedAsset();
  }

  /** Xoá cả cặp (asset + deprn) khỏi FIXED ASSETS và khỏi danh sách links */
  deleteFixedLink(row: FixedLinkRow) {
    const faRoot = this.roots.find((r) => r.desc === 'FIXED ASSETS');
    if (!faRoot || !faRoot.children) return;

    const removeId = (id: string) => {
      const idx = faRoot.children!.findIndex((n) => n.id === id);
      if (idx >= 0) faRoot.children!.splice(idx, 1);
    };

    removeId(row.assetId);
    removeId(row.deprId);

    const i = this.fixedLinks.findIndex((x) => x.assetId === row.assetId && x.deprId === row.deprId);
    if (i >= 0) this.fixedLinks.splice(i, 1);
  }

  // ===== Bank/Cash/Deposit =====
  openBankCash(parentId?: string) {
    this.bankCash = {
      parentId:
        parentId ??
        this.defaultParentFromSelection() ??
        this.roots.find((r) => r.desc === 'CURRENT ASSETS')?.id ??
        null,
      mode: 'Bank',
      underType: 'Current Assets',
      code: '',
      desc: '',
      currency: 'MYR',
      cashflow: 'Operating Activities',
      odLimit: 0,
      methods: [],
      newMethod: {
        name: 'CHEQUE',
        journalType: 'BANK',
        bankChargeAcc: '',
        bankChargeRate: 0,
        paymentBy: 'CHEQUE',
        paymentType: 'Cash',
        requireExtraInfo: true,
        mergeBankCharge: true,
        pvFormat: 'PV Default',
        orFormat: 'ORB',
      },
    };
    this.ui.bankCashOpen = true;
  }
  addPaymentMethod() {
    this.bankCash.methods.push({ ...this.bankCash.newMethod });
  }
  removePaymentMethod(i: number) {
    this.bankCash.methods.splice(i, 1);
  }
  saveBankCash() {
    if (!this.bankCash.parentId) {
      alert('Select parent type.');
      return;
    }
    const parent = this.getNode(this.bankCash.parentId)!;
    const specialMap: Record<'Bank' | 'Cash' | 'Deposit', string> = { Bank: 'SCK', Cash: 'SCH', Deposit: 'SCS' };
    parent.children = parent.children ?? [];
    parent.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.bankCash.code,
      desc: this.bankCash.desc,
      specialCode: specialMap[this.bankCash.mode],
      currency: this.bankCash.currency,
      balance: 0,
      canCarryChildren: false,
      children: [],
    });
    parent.expanded = true;
    this.ui.bankCashOpen = false;
  }

  // ===== Debtor / Creditor Control =====
  openDebtorCtrl() {
    this.debtorCtrl = {
      parentId: this.defaultParentFromSelection() ?? this.roots.find((r) => r.desc === 'CURRENT ASSETS')?.id ?? null,
      code: '',
      desc: 'DEBTOR CONTROL (NORTHERN)',
    };
    this.ui.debtorCtrlOpen = true;
  }
  saveDebtorCtrl() {
    if (!this.debtorCtrl.parentId) return;
    const p = this.getNode(this.debtorCtrl.parentId)!;
    p.children = p.children ?? [];
    p.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.debtorCtrl.code,
      desc: this.debtorCtrl.desc,
      specialCode: 'SDC',
      currency: 'MYR',
      balance: 0,
      canCarryChildren: false,
      children: [],
    });
    p.expanded = true;
    this.ui.debtorCtrlOpen = false;
  }
  openCreditorCtrl() {
    if (!this.roots.find((r) => r.desc === 'CURRENT LIABILITIES')) {
      this.roots.push({ id: 'T-CL', kind: 'type', desc: 'CURRENT LIABILITIES', expanded: true, children: [] });
    }
    this.creditorCtrl = {
      parentId: this.defaultParentFromSelection() ?? 'T-CL',
      code: '',
      desc: 'CREDITOR CONTROL (NORTHERN)',
    };
    this.ui.creditorCtrlOpen = true;
  }
  saveCreditorCtrl() {
    const p = this.getNode(this.creditorCtrl.parentId!)!;
    p.children = p.children ?? [];
    p.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.creditorCtrl.code,
      desc: this.creditorCtrl.desc,
      specialCode: 'SCL',
      currency: 'MYR',
      balance: 0,
      canCarryChildren: false,
      children: [],
    });
    p.expanded = true;
    this.ui.creditorCtrlOpen = false;
  }

  // ===== Stock =====
  openStock() {
    if (!this.roots.find((r) => r.desc === 'COST OF GOODS SOLD')) {
      this.roots.push({ id: 'T-COGS', kind: 'type', desc: 'COST OF GOODS SOLD', expanded: true, children: [] });
    }
    this.stock = {
      parentIdOpenClose: this.defaultParentFromSelection() ?? 'T-COGS',
      parentIdBalance: this.roots.find((r) => r.desc === 'CURRENT ASSETS')?.id ?? null,
      openCode: '600-OPST',
      closeCode: '699-CLST',
      balCode: '333-BSST',
      currency: 'MYR',
    };
    this.ui.stockOpen = true;
  }
  saveStock() {
    const pOC = this.getNode(this.stock.parentIdOpenClose!)!;
    const pBS = this.getNode(this.stock.parentIdBalance!)!;
    pOC.children = pOC.children ?? [];
    pBS.children = pBS.children ?? [];
    pOC.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.stock.openCode,
      desc: 'STOCK - OPENING',
      specialCode: 'SOS',
      currency: this.stock.currency,
      children: [],
    });
    pOC.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.stock.closeCode,
      desc: 'STOCK - CLOSING',
      specialCode: 'SCS',
      currency: this.stock.currency,
      children: [],
    });
    pBS.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.stock.balCode,
      desc: 'BALANCE SHEET STOCK',
      specialCode: 'SCS',
      currency: this.stock.currency,
      children: [],
    });
    pOC.expanded = pBS.expanded = true;
    this.ui.stockOpen = false;
  }

  // ===== Retained Earning =====
  openRetained() {
    this.retained = {
      parentId: this.defaultParentFromSelection() ?? this.roots.find((r) => r.desc === 'RETAINED EARNING')?.id ?? null,
      code: '150-0000',
      desc: 'RETAINED EARNING',
    };
    this.ui.retainedOpen = true;
  }
  saveRetained() {
    for (const r of this.allNodes()) if (r.specialCode === 'SRE') r.specialCode = undefined;
    const p = this.getNode(this.retained.parentId!)!;
    p.children = p.children ?? [];
    p.children.push({
      id: this.genId('S'),
      kind: 'special',
      code: this.retained.code,
      desc: this.retained.desc,
      specialCode: 'SRE',
      currency: 'MYR',
      children: [],
    });
    p.expanded = true;
    this.ui.retainedOpen = false;
  }

  // ===== Edit / Delete / Drill / Print =====
  openEdit(node: AccountNode) {
    this.edit = { nodeId: node.id, parentId: this.findParentId(node.id), code: node.code ?? '', desc: node.desc, currency: node.currency ?? 'MYR' };
    this.ui.editOpen = true;
  }
  saveEdit() {
    const n = this.getNode(this.edit.nodeId)!;
    n.code = this.edit.code;
    n.desc = this.edit.desc;
    n.currency = this.edit.currency;

    const currentParent = this.findParentId(n.id);
    if (this.edit.parentId && this.edit.parentId !== currentParent) {
      this.moveNode(n.id, this.edit.parentId);
    }
    this.ui.editOpen = false;
  }

  canDelete(node: AccountNode): boolean {
    const hasChild = !!(node.children && node.children.length);
    const hasBal = !!(node.balance && node.balance !== 0);
    return !hasChild && !hasBal && !node.hasTxn && node.kind !== 'type';
  }
  delete(node: AccountNode) {
    if (!this.canDelete(node)) {
      alert('Chỉ xoá được tài khoản không có giao dịch, không số dư, không có con.');
      return;
    }
    const removeFrom = (arr: AccountNode[]) => {
      const idx = arr.findIndex((x) => x.id === node.id);
      if (idx >= 0) {
        arr.splice(idx, 1);
        return true;
      }
      for (const x of arr) if (x.children && removeFrom(x.children)) return true;
      return false;
    };
    removeFrom(this.roots);
  }

  drill(node: AccountNode) {
    alert(`Drill-down demo: ${node.desc} (${node.code ?? '-'})`);
  }

  print() {
    const html = `
      <html><head><title>Chart of Accounts</title>
      <style>
        body{font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif}
        table{border-collapse:collapse;width:100%}
        th,td{border:1px solid #ddd;padding:6px;font-size:12px}
        .type{background:#f6e7c8}
        .special{background:#eaf2ff}
      </style></head><body>
      <h3>Chart of Accounts (Up-To-Date: ${this.upToDate})</h3>
      <table>
        <thead><tr><th>Description</th><th>Acc. No.</th><th>Special</th><th>Currency</th><th class="r">Balance</th></tr></thead>
        <tbody>
          ${this.flat
            .map(
              (r) => `
            <tr class="${r.node.kind === 'type' ? 'type' : ''} ${r.node.kind === 'special' ? 'special' : ''}">
              <td>${'&nbsp;'.repeat(r.depth * 4)}${r.node.desc}</td>
              <td>${r.node.code ?? ''}</td>
              <td>${r.node.specialCode ?? ''}</td>
              <td>${r.node.currency ?? ''}</td>
              <td style="text-align:right">${(r.node.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
      <script>window.print();</script>
      </body></html>`;
    const w = window.open('', '_blank', 'width=900,height=700');
    w!.document.write(html);
    w!.document.close();
  }

  // dữ liệu render cho popup Fixed Asset Links
  fixedLinks: FixedLinkRow[] = [];
}
