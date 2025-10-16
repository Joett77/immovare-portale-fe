import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 0;
  maxVisiblePages: number = 5;
  pageChange = output<number>();
  totalPagesArr: (number | string)[] = [];


  ngOnChanges(changes: SimpleChanges): void {
    this.totalPageArray();
  }

  totalPageArray() {
    this.totalPagesArr = [];

    if (this.totalPages <= this.maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        this.totalPagesArr.push(i);
      }
    } else {
      const halfVisible = Math.floor(this.maxVisiblePages / 2);

      if (this.currentPage <= halfVisible + 1) {
        for (let i = 1; i <= this.maxVisiblePages - 1; i++) {
          this.totalPagesArr.push(i);
        }
        this.totalPagesArr.push('...');
        this.totalPagesArr.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - halfVisible) {
        this.totalPagesArr.push(1);
        this.totalPagesArr.push('...');
        for (let i = this.totalPages - this.maxVisiblePages + 2; i <= this.totalPages; i++) {
          this.totalPagesArr.push(i);
        }
      } else {
        this.totalPagesArr.push(1);
        this.totalPagesArr.push('...');

        const start = this.currentPage - Math.floor((this.maxVisiblePages - 4) / 2);
        const end = this.currentPage + Math.floor((this.maxVisiblePages - 4) / 2);

        for (let i = start; i <= end; i++) {
          this.totalPagesArr.push(i);
        }

        this.totalPagesArr.push('...');
        this.totalPagesArr.push(this.totalPages);
      }
    }
  }

  loadPage(page: number|string) {
    if (typeof(page) === 'number') {
      if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
        this.pageChange.emit(page);
      }
    }
  }
}
