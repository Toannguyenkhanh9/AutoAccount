import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class TrialBalanceReportService {
  private authService = inject(AuthService);

}
