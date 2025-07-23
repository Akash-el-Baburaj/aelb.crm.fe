import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PaymentsService } from '../../../services/payments.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatMenuModule,
    MatButtonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDialogModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    FormsModule,
    NgIf,
    NgFor
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.scss',
})
export class InvoicesComponent implements OnInit{
  displayedColumns: string[] = [
    'paymentID',
    'customer',
    'email',
    'phone',
    'productOrService',
    'totalAmount',
    'paidAmount',
    'balanceAmount',
    'paymentEMIs',
    'nextEMIAmount',
    'nextInstallmentDate',
    'action'
  ];
  dataSource = new MatTableDataSource<any>([]);
  selection = new SelectionModel<PaymentElement>(true, []);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('installmentDialog') installmentDialog!: TemplateRef<any>;
  @ViewChild('installmentPaymentDialog') installmentPaymentDialog!: TemplateRef<any>;
  @ViewChild('generateInvoiceDialog') generateInvoiceDialog!: TemplateRef<any>;

  selectedPayment: any;
  installmentCount: number = 2;
  installments: { emiAmount: number; emiDate: string }[] = [];
  productOrServiceAmount: number = 0;
  balanceAmount: number = 0;

  invoiceAmount: number = 0;
  invoiceDiscount: number = 0;
  invoiceReduction: number = 0;
  selectedPaymentId: string | number | null = null;
  nextEmiPayment: string | number | null = null;

  payments: any[] = [];
  currentInstallmentIndex: number | null = null;
  editEmiAmount: number | null = null;
  selectedPaymentEMI: any;

  constructor(
    public themeService: CustomizerSettingsService,
    private dialog: MatDialog,
    private paymentService: PaymentsService,
    private toast: ToastrService
  ) {}

  ngOnInit(): void {
    this.getPayments();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getPayments(){
    this.paymentService.getAllPayments().subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.payments = res.payments;
          
          this.dataSource.data = res.payments.map((payment: any) => ({
            paymentID: payment.id,
            customer: {
              img: payment.Customer.image,
              name: payment.Customer.name,
            },
            email: payment.Customer.email,
            phone: payment.Customer.phone,
            productOrService: payment.ProductOrService.name,
            // productOrService: {
            //   img: payment.ProductOrService.image,
            //   name: payment.ProductOrService.name
            // },
            totalAmount: payment.totalAmount,
            paidAmount: payment.paidAmount,
            balanceAmount: payment.balanceAmount,
            installments: {
              emiCount: payment.EMICount,
              nextEmiDate: payment.nextEMIPaymentDate,
              paidEmiCount: payment.paidEMICount,
              balanceEmiCount: payment.balanceEMICount
            }, 
            PaymentEMIs: payment.PaymentEMIs,
            nextEMIAmount: payment.nextEMIAmount,
            nextInstallmentDate: payment.nextEMIPaymentDate,
            action: {
              view: 'visibility',
              print: 'print',
              delete: 'delete',
              invoice: 'payment'
            }
          }))
        }
      }
    })
  }

  getPaidEmiCount(emis: any[]): number {
    return emis.filter(emi => emi.status === 'paid').length;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openInstallmentDialog(element: any): void {
    this.selectedPayment = element;
    this.selectedPaymentId = element.paymentID;
    this.productOrServiceAmount = parseFloat(element.totalAmount);
    this.installmentCount = 2;
    this.installments = [];
    this.dialog.open(this.installmentDialog, { width: '90vw', maxWidth: '900px' });
  }

  generateInstallments(): void {
    const baseAmount = +(this.productOrServiceAmount / this.installmentCount).toFixed(2);
    const today = new Date();
    this.installments = [];

    for (let i = 0; i < this.installmentCount; i++) {
      const installmentDate = new Date(today);
      installmentDate.setMonth(today.getMonth() + i + 1);
      const formattedDate = installmentDate.toISOString().split('T')[0];

      this.installments.push({
        emiAmount: baseAmount,
        emiDate: formattedDate
      });
    }

    // Fix last installment for rounding difference
    const totalAssigned = baseAmount * this.installmentCount;
    const diff = +(this.productOrServiceAmount - totalAssigned).toFixed(2);
    if (diff !== 0) {
      this.installments[this.installmentCount - 1].emiAmount += diff;
    }
  }

  onAmountChange(index: number): void {
    // Calculate sum of all previous EMIs (excluding the changed one)
    const sumBefore = this.installments
      .slice(0, index)
      .reduce((sum, inst) => sum + inst.emiAmount, 0);

    // The user just edited this one:
    let current = this.installments[index].emiAmount;

    // Calculate the remaining balance after this installment
    let remaining = this.productOrServiceAmount - sumBefore - current;

    if (remaining < 0) {
      // If the user over-allocated, set this EMI to the remaining possible, and all after to 0
      this.installments[index].emiAmount = this.productOrServiceAmount - sumBefore;
      for (let i = index + 1; i < this.installments.length; i++) {
        this.installments[i].emiAmount = 0;
      }
    } else {
      // Otherwise, distribute the remaining balance among the remaining EMIs
      const remainingCount = this.installments.length - (index + 1);
      if (remainingCount > 0) {
        const baseAmount = +(remaining / remainingCount).toFixed(2);
        for (let i = index + 1; i < this.installments.length; i++) {
          this.installments[i].emiAmount = baseAmount;
        }
        // Fix last installment for rounding difference
        const totalSoFar = this.installments
          .slice(0, this.installments.length - 1)
          .reduce((sum, inst) => sum + inst.emiAmount, 0);
        this.installments[this.installments.length - 1].emiAmount =
          +(this.productOrServiceAmount - totalSoFar).toFixed(2);
      }
    }

    // Remove any zero-amount installments at the end
    while (
      this.installments.length > 1 &&
      this.installments[this.installments.length - 1].emiAmount === 0
    ) {
      this.installments.pop();
      this.installmentCount = this.installments.length;
    }
  }

  updateAllDates(event: Event): void {
    const newDate = (event.target as HTMLInputElement).value;
    this.installments.forEach(inst => inst.emiDate = newDate);
  }

  saveInstallments() {
    this.installments = this.installments.filter(inst => inst.emiAmount > 0);
    const id = this.selectedPaymentId;
    const payload = {
      totalEmiCount : this.installments.length, 
      emis: this.installments
    };
    console.log('Installments saved:', this.installments);
    console.log('Installments payload:', payload);
    this.sendInstallments(id, payload)
    this.dialog.closeAll();
  }

  sendInstallments(id: any, payload: any) {
    this.paymentService.convertPaymentToEMI(id, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toast.success(res.message, 'Success!');
          this.getPayments();
          this.selectedPayment = null;
          this.selectedPaymentId = null;
        }
      }
    })
  }

  closeModal(): void {
    this.dialog.closeAll();
  }

  clearInstallments(): void {
    this.installments = [];
    this.installmentCount = 1;
  }

  openGenerateInvoiceDialog(element: any): void {
    // Find the full payment object for this row
    const payment = this.payments.find(p => p.id === element.paymentID);
    this.selectedPaymentId = element.paymentID;
    this.invoiceAmount = payment?.totalAmount || 0;
    this.invoiceDiscount = payment?.invoiceDiscount || 0;
    this.invoiceReduction = payment?.invoiceReduction || 0;
    this.dialog.open(this.generateInvoiceDialog, { width: '400px' });
  }

  submitGenerateInvoice(): void {
    if (!this.selectedPaymentId) return;
    const id = this.selectedPaymentId;
    const payload = {
      invoiceAmount: this.invoiceAmount,
      invoiceDiscount: this.invoiceDiscount,
      invoiceReduction: this.invoiceReduction
    }
    this.paymentService.generateInvoice(id, payload).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.toast.success(res.message, 'Success!')
          this.getPayments();
          this.closeModal();
        }
      },
      error: (err) => {
        this.toast.error(err.error.message, 'Error!')
      }
    });
  }

  getInstallmentLabel(index: number, total: number): string {
    if (index === 0) return 'First Installment';
    if (index === 1) return 'Second Installment';
    if (index === 2) return 'Third Installment';
    if (index === total - 1) return 'Last Installment';
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = (index + 1) % 100;
    return `${index + 1}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]} Installment`;
  }

  openNextInstallmentDialog(element: any, installmentIndex: number = 0): void {
    this.selectedPayment = element;
    this.selectedPaymentId = element.paymentID;
    this.selectedPaymentEMI = element.PaymentEMIs.find((emi: any) => emi.status === 'pending');
    this.currentInstallmentIndex = installmentIndex;
    console.log(this.selectedPaymentEMI);
    this.editEmiAmount = this.selectedPaymentEMI.emiAmount || 0;
    this.dialog.open(this.installmentPaymentDialog, { width: '90vw', maxWidth: '900px' });
  }

  adjustEmiAmount(change: number) {
    const amount = this.editEmiAmount || 0;
    this.editEmiAmount = Math.max(0, amount + change);
  }

  payEmiAmount() {
    const id = this.selectedPaymentId;
    const emiId = this.selectedPaymentEMI.id;
    const payload = {
      amountPaid: this.editEmiAmount
    }

    console.log(id, emiId, payload);
    this.paymentService.emiPayment(id, emiId, payload).subscribe({
      next: (res: any) => {
        console.log(res);
        this.toast.success(res.message, 'Success!');
        this.getPayments();
        this.closeModal();
        this.selectedPayment = null;
        this.selectedPaymentId = null;
        this.selectedPaymentEMI = null;
        this.currentInstallmentIndex = null;
      }, error: (err) => {
        this.toast.error(err.error.message, 'Error!');
      }
    })
  }
  
  
}



  

export interface PaymentElement {
    paymentID: string;
    customer: {
      img: string;
      name: string;
    };
    email: string;
    productOrService: string;
    totalAmount: string;
    paidAmount: string;
    balanceAmount: string;
    installments: string; 
    nextInstallmentDate: string;
    action: {
      view: string;
      print: string;
      delete: string;
    };
  }
  