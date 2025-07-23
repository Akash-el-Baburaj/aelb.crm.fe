import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductOrServiceService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllProductsOrServices(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products-or-services`);
  }

  getProductOrServiceById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/products-or-services/${id}`);
  }

  createProductOrService(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/products-or-services`, data);
  }

  updateProductOrService(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/products-or-services/${id}`, data);
  }

  deleteProductOrService(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products-or-services}/${id}`);
  }
}
