import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CreditorStatementReportService {
  private authService = inject(AuthService);

}
