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

    displayedColumns: string[] = ['userID', 'user', 'email', 'location', 'phone', 'projects', 'joinDate', 'action'];
    dataSource = new MatTableDataSource<PeriodicElement>([]);
    selection = new SelectionModel<PeriodicElement>(true, []);
    userList: any[] = [];

    editingUserId: number | null = null;

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
        this.getUsers();
    }

    getUsers() {
        this.userService.getUsers().subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.userList = res.data;
      
              // Map API data to PeriodicElement[]
              const tableData: PeriodicElement[] = res.data.map((user: any) => ({
                userID: user.id?.toString() ?? '',
                user: {
                  name: user.name,
                  image: user.image
                },
                email: user.email,
                location: user.designation ?? '-',
                phone: user.phone ?? '-',
                projects: user.tasks?.length || 0,
                joinDate: user.created_at,
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
        this.editingUserId = user.id;
        this.dialog.open(confirmDialog, {
          data: user,
          width: '350px'
        });
     
      }
    
      deleteUser(){
        this.userService.deleteUser(Number(this.editingUserId)).subscribe({
          next: (res: any) => {
            if (res.success) {
              this.toast.success(res.message, 'Success');
              this.getUsers();
              this.editingUserId = null;
              this.closeModal();
            } else this.toast.error(res.message, 'Error')
          }
        })
      }
      

}


export interface PeriodicElement {
    userID: string;
    user: any;
    email: string;
    location: string;
    phone: string;
    projects: number;
    joinDate: string;
    action: any;
}