import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { NgxEditorModule, Editor, Toolbar } from 'ngx-editor';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductOrServiceService } from '../../../services/product-or-service.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-e-edit-product',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, FileUploadModule, NgxEditorModule, NgIf],
    templateUrl: './e-edit-product.component.html',
    styleUrl: './e-edit-product.component.scss'
})
export class EEditProductComponent {

    // Select Value
    productTypeSelected = 'option1';
    brandTypeSelected = 'option1';
    categorySelected = 'option1';
    vendorSelected = 'option1';
    collectionSelected = 'option1';

    // Text Editor
    editor!: Editor | null;  // Make it nullable
    toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link', 'image'],
        ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];

    productForm!: FormGroup;
    base64Image: string | null = null;
    productId: number | null = null;

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            // Initialize the editor only in the browser
            this.editor = new Editor();
        }
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            details: ['', Validators.required],
            amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
            discount: ['', Validators.required],
            image: [''],
            status: ['', Validators.required],
            taxDetails: ['', Validators.required]
        });
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.productId = +params['id'];
                this.productService.getProductOrServiceById(this.productId).subscribe({
                    next: (res: any) => {
                        if (res.status === 'success') {
                            const product = res.product;
                            this.productForm.patchValue({...product, status: product.status});
                                                        this.base64Image = product.image;

                        }
                    },
                    error: (err) => {
                        this.toast.error(err?.error?.message || 'Failed to fetch product', 'Error');
                        this.router.navigate(['/products']);
                    }
                });
            }
        });
    }

    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId) && this.editor) {
            this.editor.destroy();
        }
    }

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private fb: FormBuilder,
        private productService: ProductOrServiceService,
        private toast: ToastrService,
        private route: ActivatedRoute,
        public router: Router
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            details: ['', Validators.required],
            amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
            discount: ['', Validators.required],
            image: ['', Validators.required],
            status: ['', Validators.required],
            taxDetails: ['', Validators.required]
        });
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.productId = +params['id'];
                this.productService.getProductOrServiceById(this.productId).subscribe({
                    next: (res: any) => {
                        if (res.status === 'success') {
                            const product = res.product;
                            console.log('res.product === ',res.product)
                            console.log('product === ',product)
                            this.productForm.patchValue(product);
                            
                            console.log('this.productForm. == ',this.productForm)
                            this.base64Image = product.image;
                            console.log('this.base64Image. == ',this.base64Image)

                        }
                    },
                    error: (err) => {
                        this.toast.error(err?.error?.message || 'Failed to fetch product', 'Error');
                        this.router.navigate(['/products']);
                    }
                });
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
                this.productForm.patchValue({ image: this.base64Image });
            };
            reader.readAsDataURL(file);
        }
    }

    onSubmit() {
        if (this.productForm.valid && this.productId) {
            const formValue = { ...this.productForm.value };
            formValue.amount = parseFloat(formValue.amount);
            if (formValue.discount) formValue.discount = parseFloat(formValue.discount);
            if (formValue.taxDetails && typeof formValue.taxDetails !== 'string') {
                formValue.taxDetails = JSON.stringify(formValue.taxDetails);
            }
            this.productService.updateProductOrService(this.productId, formValue).subscribe({
                next: () => {
                    this.toast.success('Product updated successfully', 'Success');
                    this.router.navigate(['/products']);
                },
                error: err => {
                    this.toast.error(err?.error?.message || 'Failed to update product', 'Error');
                }
            });
        } else {
            this.productForm.markAllAsTouched();
        }
    }
}