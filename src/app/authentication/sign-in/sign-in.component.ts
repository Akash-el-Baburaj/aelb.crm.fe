import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../services/users.service';

@Component({
    selector: 'app-sign-in',
    imports: [RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, MatCheckboxModule, ReactiveFormsModule, NgIf],
    templateUrl: './sign-in.component.html',
    styleUrl: './sign-in.component.scss'
})
export class SignInComponent {

    constructor(
        private fb: FormBuilder,
        private router: Router,
        public themeService: CustomizerSettingsService,
        private authService: AuthService,
        private toast: ToastrService,
        private userService: UsersService
    ) {
        this.authForm = this.fb.group({
            email: ['admin@aelbcrm.com', [Validators.required, Validators.email]],
            password: ['password', [Validators.required, Validators.minLength(8)]],
        });
    }

    // Password Hide
    hide = true;
    userProfile: any;
    userId: any;
    // Form
    authForm: FormGroup;
    onSubmit() {
        if (this.authForm.valid) {
            const data = this.authForm.value;
            this.authService.login(data).subscribe({
                next: (res: any) => {
                    console.log(res)
                    if (res.status === 'success') {
                        localStorage.setItem('token', res.data.token)
                        localStorage.setItem('role', res.data.user.role)
                        localStorage.setItem('userId',res.data.user.id )
                        this.userId = res.data.user.id;
                        this.toast.success(res.message, 'Success')
                        // if (res.data.user.role !== 'superadmin') {
                            this.getUserProfile(this.userId);
                        // }
                        
                        this.router.navigate(['/']);
                    } else {
                        this.toast.error(res.message, 'Error')
                    }
                },
                error: (err) => {
                    console.error(err)
                    this.toast.error(err.error.message, 'Error')

                }
            })
            // this.router.navigate(['/']);
        } else {
            console.log('Form is invalid. Please check the fields.');
        }
    }

    getUserProfile(id: any) {
        this.userService.getUserById(id).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.userProfile = res.data;
                    localStorage.setItem('profile', JSON.stringify(this.userProfile))
                }
            }
        })
    }

}