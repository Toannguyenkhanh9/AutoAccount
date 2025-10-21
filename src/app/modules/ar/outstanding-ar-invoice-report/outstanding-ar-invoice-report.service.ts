import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class OutstandingARInvoiceReportService {
  private authService = inject(AuthService);

}
