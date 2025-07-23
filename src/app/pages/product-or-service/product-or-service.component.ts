import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-product-or-service-page',
    imports: [RouterOutlet],
    templateUrl: './product-or-service.component.html',
    styleUrl: './product-or-service.component.scss'
})
export class ProductOrServiceComponent {}