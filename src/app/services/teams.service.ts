import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getTeams(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/teams`)
  }

  createTeam(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/teams`, data)
  }

  updateTeam(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/teams/${id}`, data);
  }

  deleteTeam(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/teams/${id}`);
  }

  getTeamById(id: number): Observable <any> {
    return this.http.get<any>(`${this.apiUrl}/teams/${id}`)
  }
}
