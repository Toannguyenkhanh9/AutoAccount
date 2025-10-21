import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class ViewTransactionSummaryService {
  private authService = inject(AuthService);

}
