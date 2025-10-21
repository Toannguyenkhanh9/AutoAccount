import { Component, OnInit } from '@angular/core';
import { InvoiceEntryService } from './invoice-entry.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-invoice-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [InvoiceEntryService],
})
export class InvoiceEntryComponent implements OnInit {
  ngOnInit(): void {}
}
