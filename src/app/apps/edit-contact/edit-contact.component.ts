import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-edit-contact',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatMenuModule, MatButtonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, FileUploadModule, MatSnackBarModule
  ],
  templateUrl: './edit-contact.component.html',
  styleUrl: './edit-contact.component.scss'
})
export class EditContactComponent implements OnInit {
  customerForm!: FormGroup;
  loading = false;
  customerId!: any;
  imageBase64: string = '';
  statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public themeService: CustomizerSettingsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: [''],
      status: ['', Validators.required],
      productOrServicePrice: [0, Validators.required],
      paidAmount: [0, Validators.required],
      balanceAmount: [0, Validators.required],
      EMICount: [0],
      nextEMIPaymentDate: [''],
      nextEMIAmount: [0],
      image: ['']
    });
    this.route.queryParams.subscribe(params => {
        if (params['id']) {
            this.customerId = +params['id'];
            this.fetchCustomer(this.customerId);
        }
    });
  }

  fetchCustomer(id: any) {
    this.loading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          const customer = res.customer;
          this.customerForm.patchValue({
            ...customer,
            nextEMIPaymentDate: customer.nextEMIPaymentDate ? customer.nextEMIPaymentDate.split('T')[0] : ''
          });
          this.imageBase64 = customer.image || '';
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to fetch customer details', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
        this.customerForm.patchValue({ image: this.imageBase64 });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.customerForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 2000 });
      return;
    }
    this.loading = true;
    let formValue = { ...this.customerForm.value, image: this.imageBase64 };

    // Ensure nextEMIPaymentDate is a valid date string or null
    if (!formValue.nextEMIPaymentDate || formValue.nextEMIPaymentDate === 'Invalid date') {
      formValue.nextEMIPaymentDate = null;
    } else if (formValue.nextEMIPaymentDate instanceof Date) {
      formValue.nextEMIPaymentDate = formValue.nextEMIPaymentDate.toISOString().split('T')[0];
    }

    this.customerService.updateCustomer(this.customerId, formValue).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          this.snackBar.open('Customer updated successfully', 'Close', { duration: 3000 });
          this.router.navigate(['/apps/contacts']);
        } else {
          this.snackBar.open(res.message || 'Failed to update customer', 'Close', { duration: 3000 });
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to update customer', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }
}
