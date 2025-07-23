import { NgClass } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { Component, HostListener } from '@angular/core';
import { ToggleService } from '../sidebar/toggle.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { UsersService } from '../../services/users.service';


@Component({
    selector: 'app-header',
    imports: [NgClass, MatMenuModule, MatButtonModule, RouterLink],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {

    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    userDetails: any;

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        private userService: UsersService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        // if (isPlatformBrowser(this.platformId)) {
        //     const profile : any = localStorage.getItem('profile') || {};
        //     this.userDetails = profile ? JSON.parse(profile) : {};
        // }
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });

    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Header Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= 50) {
            this.isSticky = true;
        } else {
            this.isSticky = false;
        }
    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId) && localStorage.getItem('token')) {
            this.getUserProfile();
        }
        // if (isPlatformBrowser(this.platformId)) {
        //   this.userDetails = JSON.parse(localStorage.getItem('profile')!);
        // }
      }

      getUserProfile() {
        this.userService.getUserProfile().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.userDetails = res.user;
                }
            }
        })
      }

}