import { Component, Input, inject, OnInit, effect } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InputSliderComponent } from '../../../../shared/atoms/input-slider/input-slider.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlanAndServiceService } from '../../../services/plan-and-service.service';
import { PaymentService } from '../../../service/payment.service';
import { Plan } from '../../../interface/plan.interface';

interface LocalPlan {
  id: number;
  name: string;
  duration: number;
  label: string;
  planData?: Plan;
}

@Component({
  selector: 'app-savings-calculator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputSliderComponent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './savings-calculator.component.html',
  styleUrl: './savings-calculator.component.scss',
})
export class SavingsCalculatorComponent implements OnInit {
  private _planService = inject(PlanAndServiceService);
  private _paymentService = inject(PaymentService);
  private _router = inject(Router);

  calculatorForm: FormGroup;
  selectedPlanId: number = 1;
  plans: LocalPlan[] = [];
  actualPlans: Plan[] = [];

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      selectedPlan: ['PRO'],
      months: [6],
      propertyPrice: [470000],
      commission: [4],
    });

    this.calculatorForm.valueChanges.subscribe(() => {
      this.calculateSavings();
    });

    effect(() => {
      const plans = this._planService.plansList$();

      // Filter out free plans
      this.actualPlans = plans.filter(plan => !plan.free);

      this.plans = this.actualPlans.map((plan, index) => ({
        id: index + 1,
        name: plan.title || 'Plan',
        duration: 6,
        label: this.getPlanLabel(plan),
        planData: plan,
      }));

      if (this.plans.length > 0) {
        this.selectedPlanId = this.plans[0].id;
        this.calculatorForm.patchValue({
          selectedPlan: this.plans[0].name,
        });
      }
    });
  }

  ngOnInit(): void {
    this._planService.getPlan({ status: 'active' });
  }

  private getPlanLabel(plan: Plan): string {
    if (plan.description) {
      return plan.description;
    }
    return '';
  }

  selectPlan(plan: LocalPlan): void {
    this.selectedPlanId = plan.id;
    this.calculatorForm.patchValue({
      selectedPlan: plan.name,
      months: plan.duration,
    });
  }

  getSelectedPlanName(): string {
    const selectedPlan = this.plans.find(p => p.id === this.selectedPlanId);
    return selectedPlan ? selectedPlan.name : 'PRO';
  }

  onSelectPlan(): void {
    const selectedPlan = this.plans.find(p => p.id === this.selectedPlanId);

    if (selectedPlan?.planData?.id) {
      this._paymentService.settings.set({
        planId: selectedPlan.planData.id,
      });

      this._router.navigate(['/property-publishing'], {
        queryParams: {
          withEvaluation: false,
        },
      });
    }
  }

  calculateSavings(): number {
    const price = this.calculatorForm.get('propertyPrice')?.value || 0;
    const commission = this.calculatorForm.get('commission')?.value || 0;

    const traditionalCost = price * (commission / 100);

    const immovareBaseCost = 999;

    return traditionalCost - immovareBaseCost;
  }

  trackByPlan(index: number, plan: LocalPlan): string {
    return `${plan.name}-${plan.duration}-${plan.id}`;
  }
}
