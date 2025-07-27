import { CommonModule, NgIf } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
// import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { CustomerService } from '../../services/customer.service';
import { PaymentsService } from '../../services/payments.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';



@Component({
  selector: 'app-inovice',
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatDialogModule, MatMenuModule, MatButtonModule, MatTableModule, NgIf, FormsModule, MatCheckboxModule, MatTooltipModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './inovice.component.html',
  styleUrls: ['./inovice.component.scss']
})
export class InoviceComponent {
  displayedColumns: string[] = ['courseID', 'courseName', 'price', 'invoiceAmount'];
  dataSource = new MatTableDataSource<any>([]);
  customerId: any;
  customer: any;
  paymentDetails: any[] = [];
  today: Date = new Date();
  dueDate: Date;

  invoiceAmount: number = 0;
  invoiceDiscount: number = 0;
  invoiceReduction: number = 0;
  selectedPaymentId: string | number | null = null;

  subTotal: number = 0;
  discountPercentage: number = 0; 
  discountAmount: number = 0;
  vatPercentage: number = 5; 
  vatAmount: number = 0;
  totalAmount: number = 0;

  @ViewChild('generateInvoiceDialog') generateInvoiceDialog!: TemplateRef<any>;
  @ViewChild('picker') datepicker!: MatDatepicker<Date>;

  constructor(
    public themeService: CustomizerSettingsService,
    private router: Router,
    private customerService: CustomerService,
    private paymentsService: PaymentsService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private toast: ToastrService,
) {
  this.route.queryParams.subscribe(params => {
    if (params['id']) {
        console.log('param = ', params)
        this.customerId = +params['id'];
        this.getCustomerById(this.customerId)
    }
  })
  this.dueDate = new Date();
  this.dueDate.setDate(this.today.getDate() + 10);

}

getCustomerById(id: any ) {
  this.customerService.getCustomerById(id).subscribe({
    next: (res: any) => {
      if (res.status ==='success') {
        this.customer = res.customer;
        this.getPaymentDetails(id);
      }
    },
    error: (error: any) => {
      console.error('Error fetching customer details: ', error);
    }
  })
}

getPaymentDetails(id: any) {
  this.paymentsService.getPaymentsByCustomerId(id).subscribe({
    next: (res: any) => {
      if (res.status ==='success') {
        this.paymentDetails = res.payments;
        const mappedData = this.paymentDetails.map((payment: any, index: number) => ({
          id: payment.id,
          productId: payment.ProductOrService.id,
          productName: payment.ProductOrService.name,
          amount: payment.ProductOrService.amount,
          discount: payment.ProductOrService.discount,
          invoiceAmount: payment.invoiceAmount,
          invoiceDiscount: payment.invoiceDiscount,
          invoiceReduction: payment.invoiceReduction
        }))

        this.dataSource.data = mappedData;
        this.calculateTotals();
      }
    },
    error: (error: any) => {
      console.error('Error fetching payment details: ', error);
    }
  })
}
calculateTotals() {
  this.subTotal = this.dataSource.data.reduce((sum, item) => sum + (item.invoiceAmount || 0), 0);
  this.discountAmount = (this.subTotal * this.discountPercentage) / 100;
  // this.vatAmount = (this.subTotal * this.vatPercentage) / 100;
  this.totalAmount = this.subTotal - this.discountAmount + this.vatAmount;
}

openDatePicker() {
  this.datepicker.open();
}

onDateChange(event: any) {
  this.dueDate = event.value;
}

openGenerateInvoiceDialog(element: any): void {
  // Find the full payment object for this row
  // const payment = this.payments.find(p => p.id === element.paymentID);
  this.selectedPaymentId = element.id;
  this.invoiceAmount = element?.invoiceAmount || element.discount || element.amount;
  this.invoiceDiscount = element?.invoiceDiscount || 0;
  this.invoiceReduction = element?.invoiceReduction || 0;
  this.dialog.open(this.generateInvoiceDialog, { width: '400px' });
}

submitGenerateInvoice(): void {
  if (!this.selectedPaymentId) return;
  const id = this.selectedPaymentId;
  const payload = {
    invoiceAmount: this.invoiceAmount - (this.invoiceDiscount || 0) - (this.invoiceReduction || 0) || this.invoiceAmount,
    invoiceDiscount: this.invoiceDiscount,
    invoiceReduction: this.invoiceReduction
  }
  this.paymentsService.generateInvoice(id, payload).subscribe({
    next: (res: any) => {
      if (res.status === 'success') {
        this.toast.success(res.message, 'Success!')
        this.getCustomerById(this.customerId);
        this.closeModal();
      }
    },
    error: (err) => {
      this.toast.error(err.error.message, 'Error!')
    }
  });
}

closeModal(): void {
  this.dialog.closeAll();
}

}