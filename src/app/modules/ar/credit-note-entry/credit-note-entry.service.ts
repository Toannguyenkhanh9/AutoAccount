import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CreditNoteEntryService {
  private authService = inject(AuthService);

}
