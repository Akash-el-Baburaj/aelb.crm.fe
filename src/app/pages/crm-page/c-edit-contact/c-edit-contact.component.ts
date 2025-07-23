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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContactsService } from '../../../services/contacts.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-c-edit-contact',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, FileUploadModule],
    templateUrl: './c-edit-contact.component.html',
    styleUrl: './c-edit-contact.component.scss'
})
export class CEditContactComponent {

    // File Uploader
    public multiple: boolean = false;
    contactForm!: FormGroup;
    base64Image: string | null = null;
    contactId: number | null = null;
    image: any;
    constructor(
        private fb: FormBuilder,
        private contactsService: ContactsService,
        private route: ActivatedRoute,
        private router: Router,
        private toast: ToastrService
    ) {
        this.initForm()
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.contactId = +params['id'];
                this.getContactById(this.contactId);
            }
        });
    }

    initForm() {
        this.contactForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            company: ['', Validators.required],
            leadSource: ['', Validators.required],
            status: ['', Validators.required],
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

    getContactById(id: any) {
        this.contactsService.getContactById(id).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    const contact = res.contact;
                    this.contactForm.patchValue({
                        name: contact.name,
                        email: contact.email,
                        phone: contact.phone,
                        company: contact.company,
                        leadSource: contact.leadSource,
                        status: contact.status,
                        image: contact.image
                    });
                    this.base64Image = contact.image;
                }
            },
            error: (err) => {
                this.toast.error(err?.error?.message || 'Failed to fetch contact', 'Error');
                this.router.navigate(['/crm-page']);
            }
        });
    }

    onSubmit() {
        if (this.contactForm.valid && this.contactId) {
            const payload = {
                ...this.contactForm.value,
                image: this.base64Image
            }
            console.log('payload = ', payload)
            this.contactsService.updateContact(this.contactId, payload).subscribe({
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

    // Select Value
    contactStatusSelected = 'option1';

}