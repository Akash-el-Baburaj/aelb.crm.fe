import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NewLeadsComponent } from './new-leads/new-leads.component';
import { ActiveLeadsComponent } from './active-leads/active-leads.component';
import { RevenueGrowthComponent } from './revenue-growth/revenue-growth.component';
import { MatCardModule } from '@angular/material/card';
import { LeadConversionComponent } from './lead-conversion/lead-conversion.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatButtonModule } from '@angular/material/button';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CLeadKanbanComponent } from '../c-lead-kanban/c-lead-kanban.component';
import { LeadService } from '../../../services/lead.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-c-leads',
    standalone: true,
    imports: [
        RouterLink,
        MatCardModule,
        NewLeadsComponent,
        ActiveLeadsComponent,
        LeadConversionComponent,
        RevenueGrowthComponent,
        MatTabsModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        NgIf,
        MatPaginatorModule,
        MatTableModule,
        MatButtonModule,
        CLeadKanbanComponent,
        MatDialogModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './c-leads.component.html',
    styleUrl: './c-leads.component.scss'
})
export class CLeadsComponent implements OnInit {

    displayedColumns: string[] = ['select', 'id', 'customer', 'email', 'phone', 'createDate', 'company', 'ProductOrServices', 'leadSource', 'status', 'action'];
    dataSource = new MatTableDataSource<PeriodicElement>([]);
    selection = new SelectionModel<PeriodicElement>(true, []);
    leadList: any[] = []
    leadIdToDelete: number | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.selection.select(...this.dataSource.data);
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: PeriodicElement): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.customer + 1}`;
    }

    // Search Filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    constructor(
        public themeService: CustomizerSettingsService,
        private leadService: LeadService,
        public dialog: MatDialog,
        public toast: ToastrService
    ) {}

    ngOnInit(): void {
        this.getLeadList();
    }

    getLeadList() {
        this.leadService.getAllLeads().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.leadList = res.leads;
                    this.dataSource.data = res.leads.map((lead: any) => ({
                        id: lead.id,
                        customer: {
                            name: lead.name,
                            img: lead.image
                        },
                        email: lead.email,
                        phone: lead.phone,
                        company: lead.company,
                        createDate: lead.lastContacted,
                        leadSource: lead.leadSource,
                        ProductOrServices: lead.ProductOrServices,
                        status: lead.status,
                        action: {
                            view: 'visibility',
                            edit: 'edit',
                            createTask: 'add_task',
                            delete: 'delete'
                        }
                    }))

                }
            }
        })
    }

    openDeleteDialog(leadId: number, confirmDialog: any) {
        this.leadIdToDelete = leadId;
        this.dialog.open(confirmDialog, { width: '350px' });
    }

    confirmDelete() {
        if (this.leadIdToDelete) {
            this.leadService.deleteLead(this.leadIdToDelete).subscribe({
                next: (res: any) => {
                    this.toast.success(res.message || 'Lead deleted successfully', 'Success');
                    this.getLeadList();
                    this.dialog.closeAll();
                },
                error: (err) => {
                    this.toast.error(err?.error?.message || 'Failed to delete lead', 'Error');
                    this.dialog.closeAll();
                }
            });
        }
    }

    closeModal() {
        this.dialog.closeAll();
    }

}



export interface PeriodicElement {
    id: string;
    customer: any;
    email: string;
    phone: string;
    createDate: string;
    company: string;
    leadSource: string;
    ProductOrServices: any;
    status: any;
    action: any;
}