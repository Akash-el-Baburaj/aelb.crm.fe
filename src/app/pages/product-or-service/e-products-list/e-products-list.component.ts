import { Component, ViewChild, TemplateRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { ProductOrServiceService } from '../../../services/product-or-service.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-e-products-list',
    imports: [
        MatCardModule,
        MatMenuModule,
        MatButtonModule,
        RouterLink,
        MatTableModule,
        MatPaginatorModule,
        MatCheckboxModule,
        MatTooltipModule,
        MatProgressSpinnerModule, 
        MatDialogModule,
        NgIf
    ],
    templateUrl: './e-products-list.component.html',
    styleUrl: './e-products-list.component.scss'
})
export class EProductsListComponent {
    displayedColumns: string[] = ['select', 'productId', 'product', 'amount', 'discount', 'status', 'taxDetails', 'action'];
    dataSource = new MatTableDataSource<any>([]);
    selection = new SelectionModel<any>(true, []);
    loading: boolean = false;
    productIdToDelete: number | null = null;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(
        public themeService: CustomizerSettingsService,
        private productService: ProductOrServiceService,
        private toast: ToastrService,
        private dialog: MatDialog,
        private router: Router
    ) {
        this.fetchProducts();
    }

    fetchProducts() {
        this.loading = true;
        this.productService.getAllProductsOrServices().subscribe({
            next: (res: any) => {
                if (res.status === 'success') {
                    this.dataSource.data = res.products.map((product: any) => ({
                        productId: product.id,
                        product: {
                            img: product.image || 'images/users/user15.jpg',
                            name: product.name
                        },
                        details: product.details,
                        amount: product.amount,
                        discount: product.discount,
                        taxDetails: product.taxDetails,
                        status: product.status
                    })) || [];
                    this.loading = false;
                }
            },
            error: (err: any) => {
                this.toast.error(err?.error?.message || 'Failed to fetch products', 'Error');
                this.loading = false;
            }
        });
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.selection.select(...this.dataSource.data);
    }

    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.productId}`;
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    openDeleteDialog(productId: number, confirmDialog: TemplateRef<any>) {
        this.productIdToDelete = productId;
        this.dialog.open(confirmDialog, { width: '350px' });
    }

    confirmDelete() {
        if (this.productIdToDelete) {
            this.loading = true;
            this.productService.deleteProductOrService(this.productIdToDelete).subscribe({
                next: () => {
                    this.toast.success('Product deleted successfully', 'Success');
                    this.fetchProducts();
                    this.dialog.closeAll();
                    this.loading = false;
                },
                error: err => {
                    this.toast.error(err?.error?.message || 'Failed to delete product', 'Error');
                    this.dialog.closeAll();
                    this.loading = false;
                }
            });
        }
    }

    closeModal() {
        this.dialog.closeAll();
    }

    goToEdit(product: any) {
        this.router.navigate(['/products/edit-product'], { queryParams: { id: product.productId } });
    }

    goToDetails(product: any) {
        this.router.navigate(['/products/product-details'], { queryParams: { id: product.productId } });
    }
}