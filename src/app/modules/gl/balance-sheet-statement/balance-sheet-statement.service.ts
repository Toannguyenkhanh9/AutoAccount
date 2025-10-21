import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class BalanceSheetStatementService {
  private authService = inject(AuthService);

}
