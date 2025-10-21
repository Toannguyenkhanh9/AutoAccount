import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class JournalOfTransactionReportService {
  private authService = inject(AuthService);

}
