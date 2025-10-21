import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class JournalEntryService {
  private authService = inject(AuthService);

}
