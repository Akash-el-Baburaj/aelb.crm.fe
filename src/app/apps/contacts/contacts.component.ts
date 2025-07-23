import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomerService } from '../../services/customer.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-contacts',
    imports: [CommonModule, MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule, NgIf, MatCheckboxModule, MatTooltipModule, MatFormFieldModule, MatIconModule, ReactiveFormsModule, MatInputModule, MatDialogModule],
    templateUrl: './contacts.component.html',
    styleUrl: './contacts.component.scss'
})
export class ContactsComponent implements OnInit {

    displayedColumns: string[] = ['select', 'contactID', 'customer', 'email', 'phone', 'lastContacted', 'course', 'leadSource', 'paidAmount', 'balanceAmount', 'status', 'action'];
    dataSource = new MatTableDataSource<CustomerElement>([]);
    selection = new SelectionModel<CustomerElement>(true, []);
    customers: any[] = [];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild('deleteDialog') deleteDialog!: TemplateRef<any>;
    customerId: any;

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
    checkboxLabel(row?: CustomerElement): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.customer.name + 1}`;
    }

    // Search Filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    constructor(
        public themeService: CustomizerSettingsService,
        private snackBar: MatSnackBar,
        private customerService: CustomerService,
        private dialog: MatDialog,
        private toast: ToastrService
    ) {}

    ngOnInit(): void {
        this.getCustomers();
    }

    getCustomers() {
        this.customerService.getAllCustomers().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.customers = res.customers;
                    this.mapCustomerData();
                }
            },
            error: (err) => {
                console.error('Failed to fetch customers:', err);
                this.snackBar.open('Failed to fetch customers', 'Close', { 
                    duration: 3000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top'
                });
            }
        });
    }

    mapCustomerData() {
        const mappedData: CustomerElement[] = this.customers.map((customer: any, index: number) => ({
            contactID: customer.id || `CUST${String(index + 1).padStart(3, '0')}`,
            customer: {
                name: customer.name || 'N/A',
                img: customer.image || 'assets/images/avatar/default-avatar.png'
            },
            email: customer.email || 'N/A',
            phone: customer.phone || 'N/A',
            lastContacted: customer.lastContacted || 'N/A',
            course: customer.company || 'N/A',
            leadSource: customer.leadSource || 'N/A',
            paidAmount: customer.paidAmount || 0,
            balanceAmount: customer.balanceAmount || 0,
            status: {
                active: customer.status === 'active' ? 'Active' : null,
                deactive: customer.status === 'inactive' ? 'Inactive' : null
            },
            action: {
                edit: 'edit',
                link: 'link',
                delete: 'delete'
            }
        }));
        
        this.dataSource.data = mappedData;
    }

    classApplied = false;
    toggleClass() {
        this.classApplied = !this.classApplied;
    }

    link: string = 'https://iprulers-crm.vercel.app/student-registration';

    copyToClipboard(input: HTMLInputElement) {
      input.select();
      document.execCommand('copy');
      this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'});

    }

    openDeleteDialog(customerId: string,confirmDialog: any) {
        this.dialog.open(confirmDialog, { width: '350px' });
        this.customerId = customerId
    }

    deleteCustomer() {
        this.customerService.deleteCustomer(this.customerId).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!')
                    this.getCustomers();
                    this.closeModal();
                } else {
                    this.toast.error(res.message, 'Error!')
                }
            },
            error: (err) => {
                console.error('Failed to delete customer:', err);
                this.toast.error(err.error.message, 'Error!')
            }
        });
    }

    closeModal() {
        this.dialog.closeAll();
    }

}

export interface CustomerElement {
    contactID: string;
    customer: {
        name: string;
        img: string;
    };
    email: string;
    phone: string;
    lastContacted: string;
    course: string;
    leadSource: string;
    paidAmount: number;
    balanceAmount: number;
    status: {
        active?: string | null;
        deactive?: string | null;
    };
    action: {
        edit: string;
        link: string;
        delete: string;
    };
}