import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DebtorStatementReportService {
  private authService = inject(AuthService);

}
