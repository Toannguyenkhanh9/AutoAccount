import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DebtorCollectionReportService {
  private authService = inject(AuthService);

}
