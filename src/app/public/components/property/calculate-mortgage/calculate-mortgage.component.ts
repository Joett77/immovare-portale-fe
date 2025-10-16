import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/molecules/select/select.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

interface MortgageForm {
  price: FormControl<string | null>;
  advance: FormControl<string | null>;
  interest: FormControl<string | null>;
  years: FormControl<string | null>;
}

@Component({
  selector: 'app-calculate-mortgage',
  standalone: true,
  imports: [CommonModule, InputComponent, SelectComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './calculate-mortgage.component.html',
  styleUrl: './calculate-mortgage.component.scss',
})
export class CalculateMortgageComponent {
  monthlyPayment: number = 0;
  circleProgress: number = 0;

  calculateMortgage = new FormGroup<MortgageForm>({
    price: new FormControl('', Validators.required),
    advance: new FormControl('', Validators.required),
    interest: new FormControl('', Validators.required),
    years: new FormControl('30', Validators.required),
  });

  calculateMortgageOptions: SelectOption[] = [
    { label: '30 anni', value: '30' },
    { label: '20 anni', value: '20' },
    { label: 'Meno di 15 anni', value: '15' },
  ];

  calculateMonthlyPayment() {
    if (this.calculateMortgage.valid) {
      const formValues = this.calculateMortgage.value;

      // Convert string values to numbers
      const price = Number(formValues.price);
      const advance = Number(formValues.advance);
      const interestRate = Number(formValues.interest) / 100; // Convert percentage to decimal
      const years = Number(formValues.years);

      // Calculate loan amount (price - advance)
      const loanAmount = price - advance;

      // Calculate monthly interest rate
      const monthlyRate = interestRate / 12;

      // Calculate total number of payments
      const numberOfPayments = years * 12;

      // Monthly mortgage payment formula:
      // P = L[c(1 + c)^n]/[(1 + c)^n - 1]
      // where:
      // P = Monthly Payment
      // L = Loan Amount
      // c = Monthly Interest Rate
      // n = Number of Payments

      const monthlyPayment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

      this.monthlyPayment = Number(monthlyPayment.toFixed(2));

      // Calculate circle progress (advance percentage)
      const advancePercentage = (advance / price) * 100;
      this.updateCircleProgress(advancePercentage);
    }
  }

  private updateCircleProgress(percentage: number) {
    this.circleProgress = percentage;

    const circle = document.querySelector('.animate-draw-circle') as SVGPathElement;
    if (circle) {
      circle.style.strokeDasharray = `${percentage}, 100`;
    }
  }

  getControl(name: keyof MortgageForm): FormControl<string | null> {
    return this.calculateMortgage.get(name) as FormControl<string | null>;
  }
}
