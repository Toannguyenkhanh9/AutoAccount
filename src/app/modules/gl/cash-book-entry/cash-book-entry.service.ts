import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CashBookEntryService {
  private authService = inject(AuthService);

}
