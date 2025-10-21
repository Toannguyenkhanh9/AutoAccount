import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HomeCardsComponent } from '../partial/home/home-cards.component';
import { CustomerPanelComponent } from '../partial/customer/customer-panel.component';
type TabKey = 'home'|'customer'|'supplier'|'stock'|'banking';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule,HomeCardsComponent,CustomerPanelComponent],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent {
 tabs: { key: TabKey; label: string }[] = [
    { key: 'home',     label: 'Home' },
    { key: 'customer', label: 'Customer' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'stock',    label: 'Stock' },
    { key: 'banking',  label: 'Banking & G/L' }
  ];

  active: TabKey = 'home';

  selectTab(key: TabKey) { this.active = key; }

  // Optional: hỗ trợ bàn phím trái/phải để đổi tab
  onKeyTabs(e: KeyboardEvent) {
    const idx = this.tabs.findIndex(t => t.key === this.active);
    if (e.key === 'ArrowRight') {
      this.active = this.tabs[(idx + 1) % this.tabs.length].key;
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
      this.active = this.tabs[(idx - 1 + this.tabs.length) % this.tabs.length].key;
      e.preventDefault();
    }
  }
}
