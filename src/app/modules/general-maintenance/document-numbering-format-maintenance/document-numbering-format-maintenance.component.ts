import { Component, OnInit } from '@angular/core';
import { DocumentNumberingFormatMaintenanceService } from './document-numbering-format-maintenance.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-document-numbering-format-maintenance',
  template: `<router-outlet />`,
  standalone: true,
  imports: [RouterOutlet],
  providers: [DocumentNumberingFormatMaintenanceService],
})
export class DocumentNumberingFormatMaintenanceComponent implements OnInit {
  ngOnInit(): void {}
}
