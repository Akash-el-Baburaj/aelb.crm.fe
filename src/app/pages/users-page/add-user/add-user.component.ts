import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FileUploadModule } from '@iplab/ngx-file-upload';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
    selector: 'app-add-user',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, RouterLink, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, FileUploadModule, MatRadioModule, MatCheckboxModule, NgIf],
    templateUrl: './add-user.component.html',
    styleUrl: './add-user.component.scss'
})
export class AddUserComponent implements OnInit {

    // File Uploader
    public multiple: boolean = false;
    userForm!: FormGroup;
    base64Image: string | null = null;
    showPassword: boolean = false;
    image: any;
    isEdit: boolean = false;

    constructor(
        public themeService: CustomizerSettingsService,
        private fb: FormBuilder,
        private userService: UsersService,
        private toast: ToastrService,
        private router: Router,
        private route: ActivatedRoute

    ) {}

    ngOnInit(): void {
       this._initUserForm();
       this.route.queryParams.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.isEdit = true;
          this.getUserById(id);
        }
      });
    }

    getUserById(id: number) {
      this.userService.getUserById(id).subscribe({
        next: (res: any) => {
          if (res.status === 'success') {
            this.patchUserForm(res.data);
          }
        }
      });
    }

    patchUserForm(user: any) {
      this.base64Image = user.image;
    
      this.userForm.patchValue({
        userName: user.name,
        email: user.email,
        phone: user.phone,
        designation: user.designation,
        role: user.role,
        status: user.status,
        password: user.password,
        confirmPassword: user.password
      });
    
      const localProfile = JSON.parse(localStorage.getItem('profile') || '{}');
      if (localProfile.role !== 'superadmin') {
        // Disable all except password fields
        this.userForm.get('userName')?.disable();
        this.userForm.get('email')?.disable();
        this.userForm.get('phone')?.disable();
        this.userForm.get('designation')?.disable();
        this.userForm.get('role')?.disable();
        this.userForm.get('status')?.disable();
      }
    }
    

    _initUserForm() {
        this.userForm = this.fb.group({
            userName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', Validators.required],
            designation: ['', Validators.required],
            role: ['', Validators.required],
            status: ['', Validators.required],
            password: ['', [
              Validators.required,
              Validators.minLength(8),
              Validators.pattern('^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$')
            ]],
            confirmPassword: ['', Validators.required]
          }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(form: FormGroup) {
        const password = form.get('password')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        return password === confirmPassword ? null : { mismatch: true };
    }

    onFileSelected(fileList: any) {
        const file = fileList[0];
        console.log('file = ', file)
        if (file) {
        const reader = new FileReader();
        reader.onload = () => {
            this.base64Image = reader.result as string;
            console.log('imag rui',this.base64Image)

        };
        reader.readAsDataURL(file);
        }

    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
     }

     onSubmit() {
        if (this.userForm.valid) {
          const formValue = this.userForm.value;
          // console.log('Form submitted!', {
          //   ...formValue,
          //   password: formValue.password,
          //   image: this.base64Image
          // });
          const payload: any = {
            name: formValue.userName,
            email: formValue.email,
            password: formValue.password,
            phone: formValue.phone,
            designation: formValue.designation,
            role: formValue.role,
            status: formValue.status,
            image: this.base64Image,
            teams: [],
            report: {},
            tasks: []
          };
          const id = this.route.snapshot.queryParamMap.get('id');
          if (id) {
            this.updateUser(+id,payload);
          } else {
            this.saveUser(payload);
          }
        } else {
          this.userForm.markAllAsTouched();
        }
      }

      saveUser(data: any): void {
        this.userService.createUser(data).subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.toast.success(res.message, 'Success!');
              this.router.navigate(['/users']);
            } else this.toast.error(res.message, 'Error!');
          }, 
          error: (err) => {
            this.toast.error(err.error.message, 'Error!');
          }
        })
      }

      updateUser(id: any, data: any): void {
        this.userService.updateUser(id,data).subscribe({
          next: (res: any) => {
            if (res.status === 'success') {
              this.toast.success(res.message, 'Success!');
              this.router.navigate(['/users']);
            } else this.toast.error(res.message, 'Error!');
          },
          error: (err) => {
            this.toast.error(err.error.message, 'Error!');
          }
        });
      }

      cancel(){
        this.userForm.reset();
        this.router.navigate(['/users']);
      }
      
}