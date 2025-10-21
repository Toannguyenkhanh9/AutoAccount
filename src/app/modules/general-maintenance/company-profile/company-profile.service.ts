import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
@Injectable()
export class CompanyProfileService {
  private authService = inject(AuthService);

}
