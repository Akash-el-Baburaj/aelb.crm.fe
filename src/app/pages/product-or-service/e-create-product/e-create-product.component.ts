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
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductOrServiceService } from '../../../services/product-or-service.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
    selector: 'app-e-create-product',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, FileUploadModule, NgxEditorModule, NgIf],
    templateUrl: './e-create-product.component.html',
    styleUrl: './e-create-product.component.scss'
})
export class ECreateProductComponent {

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
    base64Image: string  = '';

    get name() { return this.productForm.get('name'); }
    get amount() { return this.productForm.get('amount'); }
    get details() { return this.productForm.get('details'); }
    get discount() { return this.productForm.get('discount'); }
    get image() { return this.productForm.get('image'); }
    get status() { return this.productForm.get('status'); }
    get taxDetails() { return this.productForm.get('taxDetails'); }

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
            status: ['active', Validators.required],
            taxDetails: ['', Validators.required]
        });
    }

    ngOnDestroy(): void {
        if (isPlatformBrowser(this.platformId) && this.editor) {
            this.editor.destroy();
        }
    }

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        public themeService: CustomizerSettingsService,
        private fb: FormBuilder,
        private productService: ProductOrServiceService,
        private toast: ToastrService,
        public router: Router
    ) {
        this.productForm = this.fb.group({
            name: ['', Validators.required],
            details: ['', Validators.required],
            amount: ['', [Validators.required, Validators.pattern('^\\d+(\\.\\d{1,2})?$')]],
            discount: ['', Validators.required],
            image: ['', Validators.required],
            status: ['active', Validators.required],
            taxDetails: ['', Validators.required]
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
        if (this.productForm.valid) {
            const formValue = { ...this.productForm.value };
            formValue.amount = parseFloat(formValue.amount);
            if (formValue.discount) formValue.discount = parseFloat(formValue.discount);
            if (formValue.taxDetails && typeof formValue.taxDetails !== 'string') {
                formValue.taxDetails = JSON.stringify(formValue.taxDetails);
            }
            this.productService.createProductOrService(formValue).subscribe({
                next: () => {
                    this.toast.success('Product created successfully', 'Success');
                    this.router.navigate(['/products']);
                },
                error: err => {
                    this.toast.error(err?.error?.message || 'Failed to create product', 'Error');
                }
            });
        } else {
            this.productForm.markAllAsTouched();
        }
    }

    cancel(){
        this.productForm.reset();
        this.router.navigate(['/products']);

    }
}