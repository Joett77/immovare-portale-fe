import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SettingsIconComponent } from '../../../../shared/atoms/icons/settings-icon/settings-icon.component';
import { Plan } from '../../../../public/interface/plan.interface';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-plan-service-actions-dropdown',
  standalone: true,
  imports: [CommonModule, SettingsIconComponent, RouterLink, ModalSmallComponent],
  templateUrl: './plan-service-actions-dropdown.component.html',
})
export class PlanServiceActionsDropdownComponent {
  @Input() plan: any | undefined = '';
  @Input() status: string | undefined = '';
  @Input() isService: boolean = false;
  @Input() isPlan: boolean = false;

  @Output() viewPlanService = new EventEmitter<string>();

  protected modalType: "disable-plan" | "enable-plan" | null = null;
  protected isLoading: boolean = false;

  private _planService = inject(PlanAndServiceService);
  private toast = inject(ToastService);

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  onViewPlan() {
    this.isOpen = false;
  }

  async onDeactivatePlan() {
    this.modalType = "disable-plan";
    this.isOpen = false;
  }

  async onActivatePlan() {
    this.modalType = "enable-plan";
    this.isOpen = false;
  }

  onEditViewService() {
    this.isOpen = false;
  }

  async onDeactivateService() {
    await this._planService.deactivatePlan(this.plan.id);
    this.toast.success('Piano disattivato con successo!');
    this.isOpen = false;
    this.viewPlanService.emit();
  }

  async onActivateService() {
    await this._planService.activatePlan(this.plan.id);
    this.toast.success('Piano Attivato con successo!');
    this.isOpen = false;
    this.viewPlanService.emit();
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected modalAction() {

    this.isLoading = true;

    if (this.modalType === 'disable-plan') {
      this._planService.deactivatePlan(this.plan.id)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
          this.viewPlanService.emit();
        })
        .then(() => {
          this.toast.success('Piano disattivato con successo!');
        })
        .catch(err => {
          console.error('Error disabling plan:', err);
          this.toast.error("Errore durante la disabilitazione del piano. Riprova più tardi.");
        });
    } else if (this.modalType === 'enable-plan') {
      const value = { ...this.plan, status: 'active' };
      this._planService.activatePlan(this.plan.id)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
          this.viewPlanService.emit();
        })
        .then(() => {
          this.toast.success('Piano attivato con successo!');
        })
        .catch(err => {
          console.error('Error disabling plan:', err);
          this.toast.error("Errore durante l'attivazione del piano. Riprova più tardi.");
        });
    }
  }
}
