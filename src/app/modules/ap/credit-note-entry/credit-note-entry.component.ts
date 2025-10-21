import { Component, OnInit } from '@angular/core';
import { CreditNoteEntryService } from './credit-note-entry.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-credit-note-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [CreditNoteEntryService],
})
export class CreditNoteEntryComponent implements OnInit {
  ngOnInit(): void {}
}
