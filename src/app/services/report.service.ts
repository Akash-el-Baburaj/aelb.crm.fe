import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {


  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTaskReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/tasks`);
  }

  getLeadConversionReport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/lead-conversions`)
  }
}
