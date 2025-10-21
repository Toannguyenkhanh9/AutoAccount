import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class LedgerReportService {
  private authService = inject(AuthService);

}
