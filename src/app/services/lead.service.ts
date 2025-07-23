import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LeadService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllLeads(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leads`);
  }

  getLeadById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/leads/${id}`);
  }

  createLead(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/leads`, data);
  }

  updateLead(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/leads/${id}`, data);
  }

  deleteLead(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/leads/${id}`);
  }
}
