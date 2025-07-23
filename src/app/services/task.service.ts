import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllTasks(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks`);
  }

  getTaskById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${id}`);
  }

  getTasksByTeamId(teamId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/team/${teamId}`);
  }

  getTasksByUserId(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/user/${userId}`);
  }

  createTask(taskData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks`, taskData);
  }

  updateTask(id: string | number, taskData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tasks/${id}`, taskData);
  }

  deleteTask(id: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${id}`);
  }

  getFilesByTaskId(taskId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tasks/${taskId}/files`);
  }

  uploadFiles(taskId: string | number, files: File[]): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(`${this.apiUrl}/tasks/${taskId}/files`, formData);
  }

  deleteFileById(fileId: string | number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/files/${fileId}`);
  }

  makeCallOnTask(id: string | number, callData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${id}/call`, callData);
  }

  sendMailOnTask(id: string | number, mailData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tasks/${id}/mail`, mailData);
  }

  downloadFileById(fileId: string | number) {
    return this.http.get(`${this.apiUrl}/tasks/files/${fileId}/download`, { responseType: 'blob' });
  }
}
