import { Component, EventEmitter, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import {
    CdkDragDrop,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem,
} from '@angular/cdk/drag-drop';
import { NgIf } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { LeadService } from '../../../services/lead.service';
import { ToastrService } from 'ngx-toastr';
import { ProductOrServiceService } from '../../../services/product-or-service.service';

@Component({
  selector: 'app-c-lead-kanban',
  imports: [RouterLink, MatCardModule, MatButtonModule, ReactiveFormsModule, FormsModule, MatMenuModule, CdkDropList, CdkDrag, CdkDropListGroup, NgIf, MatSelectModule, MatInputModule, MatDatepickerModule, MatFormFieldModule, MatNativeDateModule, MatTooltipModule,ReactiveFormsModule, FormsModule, FileUploadModule],
  templateUrl: './c-lead-kanban.component.html',
  styleUrl: './c-lead-kanban.component.scss'
})
export class CLeadKanbanComponent {
    public multiple: boolean = false;
    open: any[] = [];
    inProgress: any[] = [];
    won: any[] = [];
    lost: any[] = [];
    classApplied = false;
    leadForm!: FormGroup;
    products: any[] = [];
    base64Image: string | null = null;

    @Output() dataChange = new EventEmitter<any>();

    constructor(
        public themeService: CustomizerSettingsService,
        private leadService: LeadService,
        private toast: ToastrService,
        private fb: FormBuilder,
        public router: Router,
        private productService: ProductOrServiceService,
    ) {
        this.leadForm = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: [''],
            company: [''],
            leadSource: [''],
            productOrServiceIds: [[], Validators.required],
            image: ['']
        });
    }

    ngOnInit() {
        this.fetchLeads();
        this.productService.getAllProductsOrServices().subscribe(res => {
            this.products = res.products || [];
        });
    }

    fetchLeads() {
        this.leadService.getAllLeads().subscribe({
            next: (res: any) => {
                if (res && res.status === 'success') {
                    this.open = res.leads.filter((l: any) => l.status === 'open');
                    this.inProgress = res.leads.filter((l: any) => l.status === 'in progress');
                    this.won = res.leads.filter((l: any) => l.status === 'won');
                    this.lost = res.leads.filter((l: any) => l.status === 'lost');
                }
            },
            error: (err) => {
                console.error('Failed to fetch leads', err);
                // Optionally show a toast if you have ToastrService injected:
                // this.toast.error('Failed to fetch leads');
            }
        });
    }

    drop(event: CdkDragDrop<any[]>) {
      if (event.previousContainer === event.container) {
          moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
            const lead = event.previousContainer.data[event.previousIndex];
            const fromStatus = this.getStatusByDropListId(event.previousContainer.id);
            const toStatus = this.getStatusByDropListId(event.container.id);
          transferArrayItem(
              event.previousContainer.data,
              event.container.data,
              event.previousIndex,
              event.currentIndex,
          );
            // You can show a toast or log the details
            console.log(`Lead '${lead.name}' moved from '${fromStatus}' to '${toStatus}'`);
            this.updateStatus(lead, toStatus)
            // Optionally, show a toast:
            // this.toast.info(`Lead '${lead.name}' moved from '${fromStatus}' to '${toStatus}'`);
        }
    }

    updateStatus(lead: any, status: string) {
        const id = lead.id;
        const payload = {
            status: status
        }
        this.leadService.updateLead(id, payload).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!');
                    this.fetchLeads();
                    this.dataChange.emit()
                }
            }
        })
    }

  toggleClass() {
      this.classApplied = !this.classApplied;
  }

    getDropListId(status: string): string {
        return `${status.replace(/\s+/g, '').toLowerCase()}DropList`;
    }

    getStatusByDropListId(dropListId: string): string {
        if (dropListId.includes('open')) return 'open';
        if (dropListId.includes('inprogress')) return 'in progress';
        if (dropListId.includes('won')) return 'won';
        if (dropListId.includes('lost')) return 'lost';
        return '';
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
                    this.toast.success('Lead created successfully');
                    this.fetchLeads();
                },
                error: err => {
                    this.toast.error(err?.error?.message || 'Failed to create lead');
                }
            });
        }
    }
}
