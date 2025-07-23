import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
import { UsersService } from '../../../services/users.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-users-list',
    imports: [CommonModule, MatCardModule, MatMenuModule, MatButtonModule, RouterLink, MatTableModule, MatPaginatorModule, MatCheckboxModule, MatTooltipModule, MatDialogModule],
    templateUrl: './users-list.component.html',
    styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {

    displayedColumns: string[] = ['userID', 'user', 'email', 'location', 'phone', 'role', 'joinDate', 'status','action'];
    dataSource = new MatTableDataSource<PeriodicElement>([]);
    selection = new SelectionModel<PeriodicElement>(true, []);
    userList: any[] = [];

    editingUserId: number | null = null;
    passwordVisibility: { [userID: string]: boolean } = {};

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    // ngAfterViewInit() {
    //     this.dataSource.paginator = this.paginator;
    // }

    // Search Filter
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    constructor(
        public themeService: CustomizerSettingsService,
        private userService: UsersService,
        private dialog: MatDialog,
        private toast: ToastrService,
    ) {}
    ngOnInit(): void {
        // Check if logged-in user is super admin
        const profile = localStorage.getItem('profile');
        let isSuperAdmin = false;
        if (profile) {
            try {
                const user = JSON.parse(profile);
                isSuperAdmin = user.role === 'superadmin';
            } catch {}
        }
        if (isSuperAdmin && !this.displayedColumns.includes('password')) {
            this.displayedColumns.splice(7, 0, 'password'); // Insert password before joinDate
        }
        this.getUsers();
    }

    getUsers() {
        this.userService.getUsers().subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.userList = res.users;
      
              // Map API data to PeriodicElement[]
              const tableData: PeriodicElement[] = res.users.map((user: any) => ({
                userID: user.id?.toString() ?? '',
                user: {
                  name: user.name,
                  image: user.image
                },
                email: user.email,
                location: user.designation ?? '-',
                phone: user.phone ?? '-',
                role: user.role ?? '-',
                password: user.password ?? '',
                // projects: user.tasks?.length || 0,
                joinDate: user.createdDate,
                status: user.status,
                action:{
                    view: 'visibility',
                    edit: 'edit',
                    createTask: 'add_task',
                    delete: 'delete'
                }
              }));
      
              this.dataSource = new MatTableDataSource<PeriodicElement>(tableData);
              this.dataSource.paginator = this.paginator;
            }
          }
        });
      }


      closeModal() {
        this.dialog.closeAll()
      }
    
      openDeleteUser(user: any, confirmDialog: TemplateRef<any>) {
        if (user.role !== 'superadmin') {
          this.editingUserId = user.userID;
          this.dialog.open(confirmDialog, {
            data: user,
            width: '350px'
          });
        } else this.toast.warning(`You can't delete super admin`, 'Warning!')
     
      }
    
      deleteUser(){
        const localProfile = JSON.parse(localStorage.getItem('profile') || '{}');

        if (Number(localProfile.id) !== Number(this.editingUserId)) {
          this.userService.deleteUser(Number(this.editingUserId)).subscribe({
            next: (res: any) => {
              if (res.status === "success") {
                this.toast.success(res.message, 'Success');
                this.getUsers();
                this.editingUserId = null;
                this.closeModal();
              } else this.toast.error(res.message, 'Error')
            },
            error: (err) => {
              this.toast.error(err.error.message, 'Error')
              this.closeModal();
            }
          })
        } else this.toast.warning(`You can't delete your account`, 'Warning')

      }
      
      togglePasswordVisibility(userID: string) {
        this.passwordVisibility[userID] = !this.passwordVisibility[userID];
      }

}


export interface PeriodicElement {
    userID: string;
    user: any;
    email: string;
    location: string;
    phone: string;
    role: any;
    password?: string;
    joinDate: string;
    status: string;
    action: any;
}