import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink, Router } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactsService } from '../../../services/contacts.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-c-create-contact',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, FileUploadModule],
    templateUrl: './c-create-contact.component.html',
    styleUrl: './c-create-contact.component.scss'
})
export class CCreateContactComponent {

    // File Uploader
    public multiple: boolean = false;
    contactForm!: FormGroup;
    base64Image: string | null = null;
    image: any;

    constructor(
        public themeService: CustomizerSettingsService,
        private fb: FormBuilder,
        private contactsService: ContactsService,
        private router: Router,
        private toast: ToastrService
    ) {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            company: ['', Validators.required],
            leadSource: ['', Validators.required],
            image: ['']
        });
    }

    onFileSelected(fileList: any) {
        const file = fileList[0];
        if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.base64Image = reader.result as string;

        };
        reader.readAsDataURL(file);
        }

    }

    onSubmit() {
        if (this.contactForm.valid ) {
            const payload = {
                ...this.contactForm.value,
                image: this.base64Image
            }
            console.log('payload = ', payload)
            this.contactsService.createContact(payload).subscribe({
                next: () => {
                    this.toast.success('Contact updated successfully', 'Success');
                    this.router.navigate(['/crm-page']);
                },
                error: err => {
                    this.toast.error(err?.error?.message || 'Failed to update contact', 'Error');
                }
            });
        } else {
            this.contactForm.markAllAsTouched();
        }
    }
}