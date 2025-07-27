import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AgentInfoComponent } from './agent-info/agent-info.component';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { TaskService } from '../../../services/task.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-hd-ticket-details',
    imports: [CommonModule, 
              MatSelectModule, 
              MatCardModule, 
              MatMenuModule, 
              MatButtonModule, 
              FileUploadModule, 
              RouterLink, 
              FormsModule, 
              MatFormFieldModule, 
              MatInputModule, 
              MatTooltipModule,
              AgentInfoComponent, 
              MatProgressSpinnerModule,
              MatDatepickerModule,
              NgxMaterialTimepickerModule,
              MatNativeDateModule],
    templateUrl: './hd-ticket-details.component.html',
    styleUrl: './hd-ticket-details.component.scss'
})
export class HdTicketDetailsComponent implements OnInit {

    taskDetails: any;
    userProfile: any
    taskId: any;
    taskFiles: any[] = [];
    fileBaseUrl = 'http://localhost:5000/uploads/'; // Adjust to your backend's file serving path

    status: any;
    priority: any;

    callStatus: any;
    callDescription: string = '';
    rescheduleDate: Date | null = null;
    cancellationReason: string = '';
    failureReason: string = '';
    completionNotes: string = '';

    emailStatus: any;
    emailDescriptiom: string = '';

    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    downloadLoading: Set<number> = new Set();
    deleteLoading: Set<number> = new Set();

    selecteFile: any;

    appointmentDate: Date | null = null;
    appointmentTime: string = '';
    appointmentDescription: string = '';
    isToday2: boolean = false;
    checkInTime: Date | null = null;
    checkOutTime: Date | null = null;
    duration: string = '';
    isSaved: boolean = false;
    minDate: Date | null = null;

    constructor(
        public themeService: CustomizerSettingsService,
        private taskService: TaskService,
        private route: ActivatedRoute,
        private userService: UsersService,
        private toast: ToastrService,
    ) {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.taskId = +params['id'];
                this.getTaskById(this.taskId);
            }
        });
        this.minDate = new Date();
        this.minDate.setHours(0, 0, 0, 0);
    }

    myFilter = (date: Date | null): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for comparison
        return date ? date.getTime() >= today.getTime() : false;
    };

    loadFiles() {
        this.taskService.getFilesByTaskId(this.taskId).subscribe({
            next: (res: any) => {
                // Support both { files: [...] } and [...] responses
                const files = Array.isArray(res) ? res : (res.files || []);
                this.taskFiles = files.map((file: any) => ({
                    ...file,
                    url: file.url || (file.filename ? this.fileBaseUrl + file.filename : '')
                }));
            }
        });
    }

    // Call this in ngOnInit and after upload/delete
    ngOnInit(): void {
        this.getUserProfile();
        this.loadFiles();
    }

    getUserProfile() {
        this.userService.getUserProfile().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.userProfile = res.user;
                    // this.status = this.userProfile.status;
                    // this.priority = this.userProfile.priority;
                }
            }
        })
    }

    getTaskById(id: any) {
        this.taskService.getTaskById(id).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.taskDetails = res.task;
                    this.status = this.taskDetails.status;
                    this.priority = this.taskDetails.priority;
                    this.loadFiles(); // Refresh file list
                }
            }
        })
    }

    isToday(date: string | Date): boolean {
        const d = new Date(date);
        const today = new Date();
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    }

    updateTask(id: any, payload: any) {
        this.taskService.updateTask(id, payload).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!');
                    this.getTaskById(id);
                }
            },
            error: (err) => {
                this.toast.error(err.error.message, 'Error!')
            }
        })
    }


    onPriorityChange(event: any) {
        this.priority = event.value;
        // Add any additional logic here
        const payload = {
            priority: this.priority
        }
        this.updateTask(this.taskId, payload)
        console.log('Priority changed:', this.priority);
    }

    onStatusChange(event: any) {
        this.status = event.value;
        // Add any additional logic here
        const payload = {
            status: this.status
        }
        this.updateTask(this.taskId, payload)
        console.log('Status changed:', this.status);
    }

    getLogMessage(log: any): string {
        const user = log.user?.name || '';
        const action = log.action || '';
        const target = log.target?.name || log.target?.taskTitle || log.targetType || '';
        let sentence = '';

        // Special handling for call action
        if (action === 'call' && log.details) {
            sentence = `${user} made a call on ${target}`;
            if (log.details.callStatus) {
                sentence += `: Status ${log.details.callStatus}`;
            }
            if (log.details.callDetails) {
                sentence += `, Details: ${log.details.callDetails}`;
            }
            return sentence;
        }

        // Special handling for mail action
        if (action === 'mail' && log.details) {
            sentence = `${user} sent an email on ${target}`;
            if (log.details.mailStatus) {
                sentence += `: Status ${log.details.mailStatus}`;
            }
            if (log.details.mailDetails) {
                sentence += `, Details: ${log.details.mailDetails}`;
            }
            return sentence;
        }

        // Default handling
        sentence = `${user} ${action} ${target}`.trim();

        if (log.assignee?.name) {
            sentence += ` to ${log.assignee.name}`;
        } else if (log.details && typeof log.details === 'object') {
            const detailsArr = Object.entries(log.details)
                .filter(([key]) => key !== 'callStatus' && key !== 'callDetails' && key !== 'mailStatus' && key !== 'mailDetails')
                .map(([key, value]) => `${key} ${value}`);
            if (detailsArr.length) {
                sentence += (sentence ? ' ' : '') + detailsArr.join(', ');
            }
        }

        if (!sentence.trim() && log.description) {
            sentence = log.description;
        }

        return sentence.trim();
    }

    getGroupedLogs(logs: any[]): any[] {
        if (!logs) return [];
        const groups: {[key: string]: any[]} = {};
        logs.forEach(log => {
            const date = new Date(log.timestamp);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            let label: string;
            if (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            ) {
                label = 'Today';
            } else if (
                date.getDate() === yesterday.getDate() &&
                date.getMonth() === yesterday.getMonth() &&
                date.getFullYear() === yesterday.getFullYear()
            ) {
                label = 'Yesterday';
            } else {
                label = formatDate(date, 'dd MMM yyyy', 'en-US');
            }

            if (!groups[label]) groups[label] = [];
            groups[label].push(log);
        });

        // Convert to array for *ngFor
        return Object.entries(groups).map(([label, logs]) => ({ label, logs }));
    }

    triggerFileInput() {
        this.fileInput.nativeElement.click();
    }

    uploadFiles(files: File[]) {
        if (!files.length) return;
        this.taskService.uploadFiles(this.taskId, files).subscribe({
            next: (res: any) => {
                if (this.toast) this.toast.success('Files uploaded successfully', 'Success!');
                this.loadFiles(); // Refresh file list
            },
            error: (err) => {
                if (this.toast) this.toast.error('File upload failed', 'Error!');
            }
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const files = Array.from(input.files);
            this.uploadFiles(files);
        }
    }

    downloadTaskFileByUserAction(file: any) {
        this.downloadLoading.add(file.id);
        if (file.fileData) {
            let uint8arr: Uint8Array;
            if (Array.isArray(file.fileData)) {
                uint8arr = new Uint8Array(file.fileData);
            } else if (file.fileData.data && Array.isArray(file.fileData.data)) {
                uint8arr = new Uint8Array(file.fileData.data);
            } else {
                uint8arr = new Uint8Array([]);
            }
            const blob = new Blob([uint8arr], { type: file.mimetype || 'application/octet-stream' });
            let filename = file.filename || 'download';
            const a = document.createElement('a');
            const objectUrl = URL.createObjectURL(blob);
            a.href = objectUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(objectUrl);
            this.downloadLoading.delete(file.id);
        } else {
            this.taskService.downloadFileById(file.id).subscribe({
                next: (blob) => {
                    let filename = file.filename || 'download';
                    const a = document.createElement('a');
                    const objectUrl = URL.createObjectURL(blob);
                    a.href = objectUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    URL.revokeObjectURL(objectUrl);
                    this.downloadLoading.delete(file.id);
                },
                error: () => {
                    this.downloadLoading.delete(file.id);
                }
            });
        }
    }

    makeCallOrMail(type: string) {
        let payload
        switch (type) {
            case 'call':
            if (this.callStatus) {
                payload = {
                    
                    callStatus: this.callStatus,
                    callDetails: this.callDescription
                      
                };
                this.callUpdate(this.taskId, payload);
            } else this.toast.warning('Please select call status, And if description there please fill it also', 'Warning!'); return;
            break;
            case 'mail': 
            if (this.emailStatus) {
                payload =   {
                    mailStatus: this.emailStatus,
                    mailDetails: this.emailDescriptiom
                  };
                  this.mailUpdate(this.taskId, payload);
            } else this.toast.warning('Please select mail status, And if description there please fill it also', 'Warning!'); return;
        }
    }

    onStatusChange2(status: string) {
        // Reset fields when status changes to avoid stale data
        this.rescheduleDate = null;
        this.cancellationReason = '';
        this.failureReason = '';
        this.completionNotes = '';
    }

    deleteFile(id: string) {
        this.taskService.deleteFileById(id).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!');
                    this.loadFiles();
                }
            },
            error: (err) => {
                this.toast.error(err.error.message, 'Error!');
            }
        })
    }

    callUpdate(id: any, data: any) {
        this.taskService.makeCallOnTask(id, data).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!');
                    this.getTaskById(id)
                }
            }
        })
    }

    mailUpdate(id: any, data: any) {
        this.taskService.sendMailOnTask(id, data).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!');
                    this.getTaskById(id)
                }
            }
        })
    }

    checkDateMatch() {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time for comparison
        const selectedDate = this.appointmentDate ? new Date(this.appointmentDate) : null;
        if (selectedDate) {
            selectedDate.setHours(0, 0, 0, 0);
            this.isToday2 = today.getTime() === selectedDate.getTime();
        } else {
            this.isToday2 = false;
        }
    }

    saveAppointment() {
        if (this.appointmentDate && this.appointmentTime) {
            this.isSaved = true;
            console.log('Appointment Saved:', {
                date: this.appointmentDate,
                time: this.appointmentTime,
                description: this.appointmentDescription
            });
        } else {
            console.log('Please select both date and time before saving.');
        }
    }

    checkIn() {
        this.checkInTime = new Date();
        console.log('Check-In Time:', this.checkInTime);
    }

    checkOut() {
        if (this.checkInTime) {
            this.checkOutTime = new Date();
            const durationMs = this.checkOutTime.getTime() - this.checkInTime.getTime();
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
            this.duration = `${hours}h ${minutes}m ${seconds}s`;
            console.log('Check-Out Time:', this.checkOutTime);
            console.log('Duration:', this.duration);
        }
    }

}