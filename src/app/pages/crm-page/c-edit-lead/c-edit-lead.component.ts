import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadService } from '../../../services/lead.service';
import { ProductOrServiceService } from '../../../services/product-or-service.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-c-edit-lead',
    standalone: true,
    imports: [
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        ReactiveFormsModule,
        FormsModule,
        NgFor,
        NgIf
    ],
    templateUrl: './c-edit-lead.component.html',
    styleUrl: './c-edit-lead.component.scss'
})
export class CEditLeadComponent implements OnInit {
    leadForm!: FormGroup;
    products: any[] = [];
    base64Image: string | null = null;
    leadId!: number;
    public dataLead: string = 'Edit';

    constructor(
        private fb: FormBuilder,
        private leadService: LeadService,
        private productService: ProductOrServiceService,
        private toastr: ToastrService,
        private route: ActivatedRoute,
        public router: Router
    ) {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                console.log('param = ', params)
                this.leadId = +params['id'];
                console.log('this.leadId == ', this.leadId)
                this.leadService.getLeadById(this.leadId).subscribe(res => {
                    const lead = res.lead;
                    this.leadForm.patchValue({
                        ...lead,
                        productOrServiceIds: (lead.ProductOrServices || []).map((p: any) => p.id)
                    });
                    this.base64Image = lead.image;
                });
            }
        });
    }

    ngOnInit() {
        this.leadForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            company: [''],
            leadSource: [''],
            productOrServiceIds: [[], Validators.required],
            image: [''],
            status: ['', Validators.required]
        });
        this.productService.getAllProductsOrServices().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.products = res.products || [];
                }
            }
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
            this.leadService.updateLead(this.leadId, this.leadForm.value).subscribe({
                next: () => {
                    this.toastr.success('Lead updated successfully');
                    this.router.navigate(['/crm-page/leads']);
                },
                error: (err) => {
                    this.toastr.error(err?.error?.message || 'Failed to update lead');
                }
            });
        }
    }
}