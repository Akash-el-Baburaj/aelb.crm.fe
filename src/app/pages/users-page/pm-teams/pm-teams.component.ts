import { Component, Inject, OnInit, PLATFORM_ID, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { TeamsService } from '../../../services/teams.service';
import { UsersService } from '../../../services/users.service';
import { CommonModule, isPlatformBrowser, NgFor, NgForOf, NgIf } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { Editor, NgxEditorModule, toHTML, Toolbar } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-pm-teams',
    imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, NgxEditorModule, MatSelectModule, MatMenuModule, MatButtonModule, RouterLink, MatProgressBarModule, NgIf, NgFor, NgForOf, MatDialogModule, ReactiveFormsModule, FileUploadModule, FormsModule, MatTooltipModule],
    templateUrl: './pm-teams.component.html',
    styleUrl: './pm-teams.component.scss'
})
export class PmTeamsComponent implements OnInit {

    teams: any[] = [];
    users: any[] = [];
    teamForm!: FormGroup;
    isEdit = false;
    editingUserId: number | null = null;
    imagePreview: string | ArrayBuffer | null = null;
    imageName: string = '';
    base64Image: string | null = null;
    image: any;
    description: any;
    teamLeader: any;

    editor!: Editor | null;  // Make it nullable
    toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        // [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link'],
        ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];


    constructor(
        public themeService: CustomizerSettingsService,
        private teamService: TeamsService,
        private userService: UsersService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        @Inject(PLATFORM_ID) private platformId: Object,
        private toast: ToastrService
    ) {}

    ngOnInit(): void {
        this.initForm();
        this.getTeamsList();
        this.getUserList();
        if (isPlatformBrowser(this.platformId)) {
          this.editor = new Editor();
      }
    }

    initForm() {
      this.teamForm = this.fb.group({
          name: ['', [Validators.required]],
          members: [[], [Validators.required]],
          teamLeaderId: [null, [Validators.required]],
      });
    }

    getTeamsList(): void {
      this.teamService.getTeams().subscribe({
          next: (res: any) => {
              if (res.status === 'success') {
                  this.teams = res.teams;
              }
          }
      })
    }

    getUserList(): void {
      this.userService.getUsers().subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.users = res.users;
          }
        }
      })
    }

    getTeamLeader(members: any, id: any): any {
      return members.find((m: any) => m.id === id);
    }

    getTeamMembers(team: any): any[] {
      return team.members
        .map((id: number) => this.users.find(u => u.id === id))
        .filter((u: any) => u); 
    }

    openUserForm(teamDialog: TemplateRef<any>, user?: any) {
        this.isEdit = !!user;
        if (user) {
          // If user.members is an array of user objects, map to IDs
          const memberIds = Array.isArray(user.members) && user.members.length && typeof user.members[0] === 'object'
            ? user.members.map((m: any) => m.id)
            : user.members || [];
          this.teamForm.patchValue({
            name: user.name,
            members: memberIds,
            teamLeaderId: user.teamLeaderId || null,
          });
          this.editingUserId = user.id;
          this.imagePreview = user.image;
          this.base64Image = user.image;
          this.image = user.image;
        } else {
          this.teamForm.reset();
          this.editingUserId = null;
        }
      
        this.dialog.open(teamDialog);
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
    
      deleteTeam(){
        this.teamService.deleteTeam(Number(this.editingUserId)).subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.toast.success(res.message, 'Success');
              this.editingUserId = null;
              this.closeModal();
              this.getTeamsList();
            }
             else this.toast.error(res.message, 'Error')
          }
        })
      }
      
      onImageChange(event: Event) {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
          this.imageName = file.name;
      
          const reader = new FileReader();
          reader.onload = () => {
            this.imagePreview = reader.result;
            this.teamForm.patchValue({ image: reader.result });
          };
          reader.readAsDataURL(file);
        }
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

    onSubmit() {
      if (this.teamForm.valid) {        
        const formValues = this.teamForm.value;
        // Ensure members is an array of IDs
        const memberIds = Array.isArray(formValues.members) && formValues.members.length && typeof formValues.members[0] === 'object'
          ? formValues.members.map((m: any) => m.id)
          : formValues.members;
        const payload: any = {
          name: formValues.name,
          image: this.base64Image,
          members: memberIds,
          teamLeaderId: formValues.teamLeaderId
        };
        if (this.editingUserId) {
          this.saveTeam(payload, this.editingUserId)
        } else {
          this.saveTeam(payload)
        }
      }
    }

    saveTeam(data: any, id?: any) {
      if (this.isEdit && id) {
        this.teamService.updateTeam(Number(id),data).subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.toast.success(res.message, 'Success!');
              this.getTeamsList();
              this.closeModal();
            }
          },
          error: (err) => {
            this.toast.error(err.error.message, 'Error!')
          }
        })
      }
      else {
        this.teamService.createTeam(data).subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.toast.success(res.message, 'Success!');
              this.getTeamsList();
              this.closeModal();
            }
          },
          error: (err) => {
            this.toast.error(err.error.message, 'Error!')
          }
        })
      }
    }

}