import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class DebitNoteEntryService {
  private authService = inject(AuthService);

}
