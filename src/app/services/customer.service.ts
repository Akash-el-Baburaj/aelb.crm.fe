import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) { }

  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers`);
  }

  getCustomerById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/customers/${id}`);
  }

  updateCustomer(id: string, customerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/customers/${id}`, customerData);
  }

  deleteCustomer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/customers/${id}`);
  }
}
