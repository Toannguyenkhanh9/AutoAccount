import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class ProfitAndLossStatementService {
  private authService = inject(AuthService);

}
