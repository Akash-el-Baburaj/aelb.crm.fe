import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '../../../services/lead.service';
import { ProductOrServiceService } from '../../../services/product-or-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-c-create-lead',
    standalone: true,
    imports: [
        // Angular Material modules
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        // Angular forms
        ReactiveFormsModule,
        FormsModule,
        NgFor,
        NgIf
    ],
    templateUrl: './c-create-lead.component.html',
    styleUrl: './c-create-lead.component.scss'
})
export class CCreateLeadComponent implements OnInit {
    leadForm!: FormGroup;
    products: any[] = [];
    base64Image: string | null = null;

    constructor(
        private fb: FormBuilder,
        private leadService: LeadService,
        private productService: ProductOrServiceService,
        private toastr: ToastrService,
        public router: Router,
        public themeService: CustomizerSettingsService
    ) {}

    ngOnInit() {
        this.leadForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            company: [''],
            leadSource: [''],
            productOrServiceIds: [[], Validators.required],
            image: ['']
        });
        this.productService.getAllProductsOrServices().subscribe(res => {
            this.products = res.products || [];
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input?.files && input.files.length > 0) {
            const file = input.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                this.base64Image = reader.result as string;
                this.leadForm.patchValue({ image: this.base64Image });
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.leadForm.valid) {
            this.leadService.createLead(this.leadForm.value).subscribe({
                next: () => {
                    this.toastr.success('Lead created successfully');
                    this.router.navigate(['/crm-page/leads']);
                },
                error: err => {
                    this.toastr.error(err?.error?.message || 'Failed to create lead');
                }
            });
        }
    }
}