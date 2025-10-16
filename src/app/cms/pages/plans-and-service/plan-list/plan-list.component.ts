import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { PlanServiceActionsDropdownComponent } from '../plan-service-actions-dropdown/plan-service-actions-dropdown.component';

import { Plan } from '../../../../public/interface/plan.interface';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { RangeSelectorComponent } from '../../../../shared/organisms/range-selector/range-selector.component';
import { Intervals } from '../../../../core/enums/intervals';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    FormsModule,
    PlusIconComponent,
    CurrencyPipe,
    RouterLink,
    DatePipe,
    FontAwesomeModule,
    SearchIconComponent,
    PlanServiceActionsDropdownComponent,
    RangeSelectorComponent,
  ],
  templateUrl: './plan-list.component.html',
  styleUrl: './plan-list.component.scss',
})
export class PlanListComponent implements OnInit {
  private planService = inject(PlanAndServiceService);

  plans = input<Plan[]>([]);
  filterDataPlan = signal<any>({
    title: '',
    status: '',
    interval: '',
    isService: undefined,
  });

  // FILTER COMPUTED
  filteredPlans = computed(() => {
    const filters = this.filterDataPlan();
    return this.plans().filter(plan => {
      return (
        (!filters.title || plan.title?.toLowerCase().includes(filters.title.toLowerCase())) &&
        (!filters.status || plan.status === filters.status) &&
        (!filters.interval || plan.interval === filters.interval) &&
        (filters.isService === undefined || plan.isService === filters.isService)
      );
    });
  });

  isLoading: boolean = false;

  faArrowRight = faArrowRight;
  faInfoCircle = faInfoCircle;

  // FILTER
  searchQuery: string = '';
  selectedStatus: string = '';
  selectedType: string = '';
  selectedDuration: string = '';
  selectedPriceRange: number | null = null;

  // Filter options
  statusOptions = [
    {
      label: 'Attivo',
      value: 'active',
    },
    {
      label: 'Disattivo',
      value: 'inactive',
    }
  ];
  typeOptions = ['Gratis', 'A pagamento'];
  durationOptions = Object.entries(Intervals);

  priceRangeOptions = [0, 50, 100, 150, 200, 250, 300];

  constructor() {
    // effect(() => {
    //   const plans = this.plans();
    //   if (plans) {
    //     this.filteredPlans = [...plans];
    //     this.applyFilters();
    //   }
    // });
  }

  ngOnInit(): void {}

  onFilterChange(newValue: string, field: string): void {
    switch (field) {
      case 'title':
        console.log('Title filter changed:', newValue);

        this.searchQuery = newValue;
        break;
      case 'status':
        this.selectedStatus = newValue;
        break;
      case 'type':
        this.selectedType = newValue;
        break;
      case 'interval':
        this.selectedDuration = newValue;
        break;
    }

    const filterData = {
      title: this.searchQuery,
      status: this.selectedStatus,
      interval: this.selectedDuration,
      isService:
        this.selectedType === 'Gratis'
          ? true
          : this.selectedType === 'A pagamento'
            ? false
            : undefined,
      priceRange: this.selectedPriceRange,
    };

    const filtered = Object.fromEntries(
      Object.entries(filterData).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );

    this.planService.updateFilterPlan(filtered);
  }

  async reloadList() {
    await this.planService.getPlan();
  }

  translateInterval(interval:any) {
    const duration = this.durationOptions.find(d => d[0] === interval);
    return duration ? duration[1] : '';
  }

  // resetFilters(): void {
  //   this.searchQuery = '';
  //   this.selectedStatus = '';
  //   this.selectedType = '';
  //   this.selectedDuration = '';
  //   this.selectedPriceRange = 0;
  //   this.onFilterChange();
  // }
}
