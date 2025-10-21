import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class ContraEntryService {
  private authService = inject(AuthService);

}
