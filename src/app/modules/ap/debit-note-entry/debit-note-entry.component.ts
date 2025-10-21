import { Component, OnInit } from '@angular/core';
import { DebitNoteEntryService } from './debit-note-entry.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-debit-note-entry',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DebitNoteEntryService],
})
export class DebitNoteEntryComponent implements OnInit {
  ngOnInit(): void {}
}
