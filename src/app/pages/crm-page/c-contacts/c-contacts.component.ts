import { NgIf, NgFor } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { ContactsService } from '../../../services/contacts.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { TemplateRef } from '@angular/core';
import { MatRadioModule } from '@angular/material/radio';
import { UsersService } from '../../../services/users.service';
import { TeamsService } from '../../../services/teams.service';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { ProductOrServiceService } from '../../../services/product-or-service.service';

@Component({
    selector: 'app-c-contacts',
    imports: [CommonModule, MatCardModule, MatMenuModule, MatButtonModule, MatSelectModule, MatDialogModule, MatRadioModule, RouterLink, MatTableModule, MatPaginatorModule, NgIf, NgFor, FormsModule, MatCheckboxModule, MatTooltipModule],
    templateUrl: './c-contacts.component.html',
    styleUrl: './c-contacts.component.scss'
})
export class CContactsComponent {

    displayedColumns: string[] = ['select', 'contactID', 'customer', 'email', 'phone', 'company', 'lastContacted', 'leadSource', 'status', 'action'];
    dataSource = new MatTableDataSource<PeriodicElement>([]);
    selection = new SelectionModel<PeriodicElement>(true, []);
    contactIdToDelete: number | null = null;
    selectedContact: any = null;
    assignTo: string | null = null;
    assignType: 'user' | 'team' = 'user';
    users: any[] = [];
    teams: any[] = [];
    products: any[] = [];
    assignProduct: any;

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
        private contactsService: ContactsService,
        private dialog: MatDialog,
        private toast: ToastrService,
        private userService: UsersService,
        private teamService: TeamsService,
        private productService: ProductOrServiceService,
    ) {
        this.fetchContacts();
        this.fetchTeams();
        this.fetchUsers();
        this.fetchProductsOrService();
    }

    fetchContacts() {
        this.contactsService.getAllContacts().subscribe(res => {
            if (Array.isArray(res.contacts)) {
                this.dataSource.data = res.contacts.map((contact: any) => ({
                    contactID: contact.id,
        customer: {
                        img: contact.image || 'images/users/user15.jpg',
                        name: contact.name
                    },
                    email: contact.email,
                    phone: contact.phone,
                    company: contact.company,
                    lastContacted: contact.lastContacted || '',
                    leadSource: contact.leadSource,
                    status: { active: contact.status === 'active' ? 'Active' : undefined, deactive: contact.status !== 'active' ? 'Deactive' : undefined },
        action: {
            view: 'visibility',
            edit: 'edit',
                        openToLead: 'open_in_browser',
                        task: 'add_task ',
            delete: 'delete'
        }
                }));
            }
        });
    }

    fetchTeams() {
        this.teamService.getTeams().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.teams = res.teams;
                }
            }
        })
    }

    fetchUsers() {
        this.userService.getUsers().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.users = res.users;
                }
            }
        })
    }

    fetchProductsOrService() {
        this.productService.getAllProductsOrServices().subscribe({
            next: (res: any) => {
                if (res.status === 'success')  {
                    this.products = res.products;
                }
            }
        })
    }

    openDeleteDialog(contactId: number, confirmDialog: TemplateRef<any>) {
        this.contactIdToDelete = contactId;
        this.dialog.open(confirmDialog, { width: '350px' });
    }

    confirmDelete() {
        if (this.contactIdToDelete) {
            this.contactsService.deleteContact(this.contactIdToDelete).subscribe({
                next: (res: any) => {
                   if (res.status === 'success'){
                    this.toast.success(res.message || 'Contact deleted successfully', 'Success');
                    this.fetchContacts();
                    this.dialog.closeAll();
                    }
                },
                error: err => {
                    this.toast.error(err?.error?.message || 'Failed to delete contact', 'Error');
                    this.dialog.closeAll();
                }
            });
        }
    }

    closeModal() {
        this.dialog.closeAll();
    }

    openAssignTaskDialog(contact: any, assignDialog: TemplateRef<any>) {
        this.selectedContact = contact;
        this.assignTo = null;
        this.assignType = 'user';
        this.dialog.open(assignDialog, { width: '400px' });
    }

    confirmAssignTask() {
        if (!this.selectedContact || !this.assignTo) return;
        const contactId = this.selectedContact.contactID;
        const payload: any = this.assignType === 'user' ? { userId: this.assignTo } : { teamId: this.assignTo };
        console.log(payload)
        this.contactsService.assignContact(Number(contactId), payload).subscribe({
            next: (res: any) => {
                this.toast.success(res?.message || 'Task assigned successfully', 'Success');
                this.fetchContacts();
                this.dialog.closeAll();
                this.selectedContact = null;
            },
            error: err => {
                this.toast.error(err?.error?.message || 'Failed to assign task', 'Error');
                this.dialog.closeAll();
            }
        });
    }

    openForwardToLeadDialog(contact: number, confirmDialog: TemplateRef<any>) {
        this.selectedContact = contact;
        this.dialog.open(confirmDialog, { width: '350px' });
    }

    forwardToLead() {
        if (!this.selectedContact || !this.assignProduct) return;
        const contactId =this.selectedContact.contactID;
        const payload: any = {productOrServiceId: this.assignProduct}
        this.contactsService.forwardContactToLead(contactId, payload).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.toast.success(res.message, 'Success!');
                    this.fetchContacts();
                    this.dialog.closeAll();
                    this.selectedContact = null;  
                    this.assignProduct = ''  
                }
            },
            error: err => {
                this.toast.error(err?.error?.message || 'Failed to assign task', 'Error');
                this.dialog.closeAll();
            }
        })
    }

}



export interface PeriodicElement {
    contactID: string;
    customer: any;
    email: string;
    phone: string;
    lastContacted: string;
    leadSource: string;
    status: any;
    action: any;
}