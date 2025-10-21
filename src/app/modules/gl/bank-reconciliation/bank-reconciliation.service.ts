import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class BankReconciliationService {
  private authService = inject(AuthService);

}
