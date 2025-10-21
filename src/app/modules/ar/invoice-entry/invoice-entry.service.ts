import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class InvoiceEntryService {
  private authService = inject(AuthService);

}
