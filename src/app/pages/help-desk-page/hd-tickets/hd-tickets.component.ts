import { CommonModule, NgIf } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TicketsOpenComponent } from '../../../dashboard/help-desk/tickets-open/tickets-open.component';
import { TicketsInProgressComponent } from '../../../dashboard/help-desk/tickets-in-progress/tickets-in-progress.component';
import { TicketsResolvedComponent } from '../../../dashboard/help-desk/tickets-resolved/tickets-resolved.component';
import { TicketsClosedComponent } from '../../../dashboard/help-desk/tickets-closed/tickets-closed.component';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TaskService } from '../../../services/task.service';

@Component({
    selector: 'app-hd-tickets',
    imports: [CommonModule, RouterLink, TicketsOpenComponent, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSelectModule, TicketsInProgressComponent, TicketsResolvedComponent, TicketsClosedComponent, MatCardModule, MatMenuModule, MatButtonModule, MatTableModule, MatPaginatorModule, NgIf, MatTooltipModule, MatProgressBarModule],
    templateUrl: './hd-tickets.component.html',
    styleUrl: './hd-tickets.component.scss'
})
export class HdTicketsComponent {

    displayedColumns: string[] = ['taskID', 'taskTitle', 'assignedTo', 'assignedType', 'status', 'createdDate',  'priority', 'action'];
    dataSource = new MatTableDataSource<any>([]);

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    createdDateFilter: Date | null = null;
    dueDateFilter: Date | null = null;
    priorityFilter: string = '';
    statusFilter: string = '';

    tasks: any[] = [];

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = this.customFilterPredicate();
    }

    constructor(
        public themeService: CustomizerSettingsService,
        private taskService: TaskService,
    ) {}

    ngOnInit() {
        this.getAllTasks();
    }

    getAllTasks() {
        this.taskService.getAllTasks().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.tasks = res.tasks;
                    this.dataSource.data = this.tasks.map(task => {
                        let assignedTo = 'Unassigned';
                        let assignedType = '';
                        if (task.User) {
                            assignedTo = task.User.name;
                            assignedType = 'User';
                        } else if (task.Team) {
                            assignedTo = task.Team.name;
                            assignedType = 'Team';
                        }
                        return {
                            taskID: task.id,
                            taskTitle: task.taskTitle,
                            assignedTo,
                            assignedType,
                            status: task.status,
                            createdDate: task.createdDate,
                            priority: task.priority
                        };
                    });
                }
            }
        });
    }

    filterCreatedDate(event: any) {
        this.createdDateFilter = event.value;
        this.applyAllFilters();
    }

    filterDueDate(event: any) {
        this.dueDateFilter = event.value;
        this.applyAllFilters();
    }

    filterPriority(event: any) {
        this.priorityFilter = event.value;
        this.applyAllFilters();
    }

    applyAllFilters() {
        this.dataSource.filter = '' + Math.random(); // Trigger table refresh
    }

    customFilterPredicate() {
        return (data: any, filter: string): boolean => {
            let matchesCreatedDate = true;
            let matchesDueDate = true;
            let matchesPriority = true;
            let matchesStatus = true;

            if (this.createdDateFilter) {
                // Assuming data.createdDate is a string like '15 Nov, 2024'
                const taskDate = new Date(data.createdDate);
                matchesCreatedDate = taskDate.toDateString() === this.createdDateFilter.toDateString();
            }

            if (this.dueDateFilter) {
                // Assuming data.dueDate is a string like '15 Dec, 2024'
                const taskDate = new Date(data.dueDate);
                matchesDueDate = taskDate.toDateString() === this.dueDateFilter.toDateString();
            }

            if (this.priorityFilter) {
                matchesPriority = data.priority === this.priorityFilter;
            }

            if (this.statusFilter) {
                // Check data.status object
                matchesStatus = Object.values(data.status).includes(this.statusFilter);
            }

            return matchesCreatedDate && matchesDueDate && matchesPriority && matchesStatus;
        };
    }

    filterStatus(event: any) {
        this.statusFilter = event.value;
        this.applyAllFilters();
    }

    resetFilters() {
        this.createdDateFilter = null;
        this.dueDateFilter = null;
        this.priorityFilter = '';
        this.statusFilter = '';
        this.applyAllFilters();
    }


    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        console.log('filterValue => ???? ',filterValue.trim().toLowerCase())
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

}