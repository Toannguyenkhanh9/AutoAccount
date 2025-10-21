import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { API_ENDPOINTS } from 'src/app/_shared/constants';
import { BaseModel, BasePageModel, BaseModelResponse } from 'src/app/_shared/models/base';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class BookHttpService {
  private http = inject(HttpClient);
  insertBook(req: any): Observable<any> {
    return this.http.post<any>(
      `${API_ENDPOINTS.account.insertBooks}`,req
    );
  }
  updateBook(id: number, req: any): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.account.updateBook(id), req);
  }
  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.account.deleteBook(id));
  }
  getBook(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.account.getBook(id));
  }

}
