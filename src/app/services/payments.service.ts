import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UpdatePaymentPayload {
  paidAmount: number;
  nextEMIPaymentDate: string;
  nextEMIAmount: number;
}

export interface ConvertPaymentToEMIPayload {
  totalEmiCount: number;
  emis: { emiAmount: number; emiDate: string }[];
}

export interface GenerateInvoicePayload {
  invoiceAmount: number;
  invoiceDiscount?: number;
  invoiceReduction?: number;
}

export interface RecordExtraPaymentPayload {
  extraAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllPayments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments`);
  }

  getPaymentById(id: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/${id}`);
  }

  getPaymentsByCustomerId(customerId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/customer/${customerId}`);
  }

  getPaymentsCollectionByTeam(teamId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/team/${teamId}/collection`);
  }

  getPaymentsCollectionByUser(userId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/payments/user/${userId}/collection`);
  }

  updatePayment(id: string | number, payload: UpdatePaymentPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/payments/${id}`, payload);
  }

  convertPaymentToEMI(id: string | number, payload: ConvertPaymentToEMIPayload): Observable<any> {
    return this.http.put(`${this.apiUrl}/payments/${id}/convert-to-emi`, payload);
  }

  emiPayment(id: any, emiId: any, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/payments/${id}/emi/${emiId}/pay`, payload);
  }

  generateInvoice(id: string | number, payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/${id}/generate-invoice`, payload);
  }

  recordExtraPayment(id: string | number, payload: RecordExtraPaymentPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/payments/${id}/extra-payment`, payload);
  }
}
