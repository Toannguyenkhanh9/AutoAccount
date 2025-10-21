import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth';
import { AuthHttpService } from 'src/app/modules/auth/services/auth-http/index';
import { BookHttpService } from 'src/app/_shared/services/api/http/index';
@Injectable()
export class ManageAccountBookService {
  private authService = inject(AuthService);
  private authHttp = inject(AuthHttpService);
    private bookHttp = inject(BookHttpService);
  getListServer() {
    return this.authHttp.getListServer();
  }
  deleteBook(id : number){
    return this.bookHttp.deleteBook(id);
  }
  editBook(id : number,book : any){
    return this.bookHttp.updateBook(id,book);
  }

}
