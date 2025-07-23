import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private apiUrl = environment.apiBaseUrl + '/contacts';

  constructor(private http: HttpClient) { }

  getAllContacts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/`);
  }

  getContactById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createContact(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/`, data);
  }

  updateContact(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteContact(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  assignContact(id: number, payload: { userId?: number; teamId?: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/assign`, payload);
  }

  forwardContactToLead(id: number, payload: { productOrServiceId: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/forward-to-lead`, payload);
  }
}
