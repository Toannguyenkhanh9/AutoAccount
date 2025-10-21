import { environment } from 'src/environments/environment';

export const API_ENDPOINTS = Object.freeze({
  account: {
    login: `${environment.apiUrl}/api/account/login`,
    loginByToken: `${environment.apiUrl}/api/account/login-by-token`,
    getListServer: `${environment.apiUrl}/api/books/get-list-server`,
    confirmCode: `${environment.apiUrl}/api/auth/confirm-code`,
    insertBooks: `${environment.apiUrl}/api/books/add-new-books`,
    updateBook: (id: number) => `${environment.apiUrl}/api/books/${id}`, // PUT
    deleteBook: (id: number) => `${environment.apiUrl}/api/books/${id}`, // DELETE
    getBook: (id: number) => `${environment.apiUrl}/api/books/${id}`, // GET
  },
});
