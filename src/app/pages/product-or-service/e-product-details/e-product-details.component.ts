import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { ProductOrServiceService } from '../../../services/product-or-service.service';

@Component({
    selector: 'app-e-product-details',
    imports: [RouterLink, MatCardModule, MatMenuModule, MatButtonModule, CarouselModule, NgFor, NgIf, FormsModule, MatTabsModule, MatFormFieldModule, MatInputModule, FormsModule, StarRatingComponent, MatProgressBarModule],
    templateUrl: './e-product-details.component.html',
    styleUrl: './e-product-details.component.scss'
})
export class EProductDetailsComponent implements OnInit {

    // Star Rating
    selectedRating: number = 2;
    productId: number | null = null;
    productDetails: any;
    // Input Counter
    value = 1;
    increment() {
        this.value++;
    }
    decrement() {
        if (this.value > 1) {
            this.value--;
        }
    }

    // Product Images
    productImages = [
        {
            url: 'images/products/product-details1.jpg'
        },
        {
            url: 'images/products/product-details2.jpg'
        },
        {
            url: 'images/products/product-details3.jpg'
        },
        {
            url: 'images/products/product-details4.jpg'
        }
    ]
    selectedImage!: string;
    changeimage(image: string){
        this.selectedImage = image;
    }

    constructor(
        public themeService: CustomizerSettingsService,
        private productService: ProductOrServiceService,
        private route: ActivatedRoute,

    ) {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.productId = +params['id'];
                this.getProductDetailsById(this.productId)
            }
        })
    }

    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }

    getProductDetailsById(id: any): void {
        this.productService.getProductOrServiceById(id).subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.productDetails = res.product;
                }
            }
        })
    }

}