import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class OutstandingAPInvoiceReportService {
  private authService = inject(AuthService);

}
