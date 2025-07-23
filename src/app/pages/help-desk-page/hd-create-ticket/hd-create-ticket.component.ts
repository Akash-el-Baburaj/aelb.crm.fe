import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, NgIf, CommonModule } from '@angular/common';
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
import { TaskService } from '../../../services/task.service';
import { UsersService } from '../../../services/users.service';
import { TeamsService } from '../../../services/teams.service';
import { ContactsService } from '../../../services/contacts.service';
import { LeadService } from '../../../services/lead.service';
import { CustomerService } from '../../../services/customer.service';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';

@Component({
  selector: 'app-hd-create-ticket',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatMenuModule, MatButtonModule, RouterLink, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, FileUploadModule, MatSnackBarModule, NgIf
  ],
  templateUrl: './hd-create-ticket.component.html',
  styleUrl: './hd-create-ticket.component.scss'
})
export class HdCreateTicketComponent implements OnInit {
  taskForm!: FormGroup;
  loading = false;
  isEdit = false;
  taskId: string | null = null;
  imageBase64: string = '';

  users: any[] = [];
  teams: any[] = [];
  contacts: any[] = [];
  leads: any[] = [];
  customers: any[] = [];
  statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'closed', label: 'Closed' }
  ];
  teamOrIndividualOptions = [
    { value: 'team', label: 'Team' },
    { value: 'individual', label: 'Individual' }
  ];
  selectedFiles: File[] = [];
  uploading = false;
  taskFiles: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public themeService: CustomizerSettingsService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService,
    private usersService: UsersService,
    private teamsService: TeamsService,
    private contactsService: ContactsService,
    private leadService: LeadService,
    private customerService: CustomerService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      taskTitle: ['', Validators.required],
      image: [''],
      teamOrIndividual: ['', Validators.required],
      status: ['', Validators.required],
      report: [''],
      details: [''],
      userId: ['', Validators.required],
      teamId: [''],
      contactId: [''],
      leadId: [''],
      customerId: ['']
    });
    this.fetchDropdowns();
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.taskId = params['id'] + '';
        this.fetchTask(this.taskId);
      }
    });
  }

  fetchDropdowns() {
    this.usersService.getUsers().subscribe(res => this.users = res.users || res);
    this.teamsService.getTeams().subscribe(res => this.teams = res.teams || res);
    this.contactsService.getAllContacts().subscribe(res => this.contacts = res.contacts || res);
    this.leadService.getAllLeads().subscribe(res => this.leads = res.leads || res);
    this.customerService.getAllCustomers().subscribe(res => this.customers = res.customers || res);
  }

  fetchTask(id: string) {
    this.loading = true;
    this.taskService.getTaskById(id).subscribe({
      next: (res: any) => {
        if (res.status === 'success') {
          const task = res.task;
          this.taskForm.patchValue({
            ...task,
            userId: task.UserId || '',
            teamId: task.TeamId || '',
            contactId: task.ContactId || '',
            leadId: task.LeadId || '',
            customerId: task.CustomerId || ''
          });
          this.imageBase64 = task.image || '';
          this.taskId = task.id || this.taskId;
          this.loadTaskFiles();
        }
        this.loading = false;
      },
      error: () => {
        this.snackBar.open('Failed to fetch task details', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadTaskFiles() {
    if (!this.taskId) return;
    this.taskService.getFilesByTaskId(this.taskId).subscribe(res => {
      if (res.status === 'success') {
        this.taskFiles = res.files;
      }
    });
  }

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
        this.taskForm.patchValue({ image: this.imageBase64 });
      };
      reader.readAsDataURL(file);
    }
  }

  uploadTaskFiles() {
    if (!this.selectedFiles.length || !this.taskId) return;
    this.uploading = true;
    this.taskService.uploadFiles(this.taskId, this.selectedFiles).subscribe({
      next: (res) => {
        this.uploading = false;
        if (res.status === 'success') {
          this.selectedFiles = [];
          this.loadTaskFiles();
        }
      },
      error: () => {
        this.uploading = false;
        this.snackBar.open('Failed to upload files', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) {
      this.snackBar.open('Please fill all required fields', 'Close', { duration: 2000 });
      return;
    }
    this.loading = true;
    const formValue = { ...this.taskForm.value, image: this.imageBase64 };
    if (this.isEdit && this.taskId) {
      this.taskService.updateTask(this.taskId, formValue).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/help-desk/tasks']);
          } else {
            this.snackBar.open(res.message || 'Failed to update task', 'Close', { duration: 3000 });
          }
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Failed to update task', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.taskService.createTask(formValue).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
            this.taskId = res.task?.id || res.taskId || null;
            this.loadTaskFiles();
            this.router.navigate(['/help-desk/tasks']);
          } else {
            this.snackBar.open(res.message || 'Failed to create task', 'Close', { duration: 3000 });
          }
          this.loading = false;
        },
        error: () => {
          this.snackBar.open('Failed to create task', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    }
  }
}