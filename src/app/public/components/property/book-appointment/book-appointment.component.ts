// book-appointment.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { ChevronLeftIconComponent } from '../../../../shared/atoms/icons/chevron-left-icon/chevron-left-icon.component';
import { ChevronRightIconComponent } from '../../../../shared/atoms/icons/chevron-right-icon/chevron-right-icon.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, ChevronLeftIconComponent, ChevronRightIconComponent],
  templateUrl: './book-appointment.component.html',
  styleUrl: './book-appointment.component.scss',
})
export class BookAppointmentComponent implements OnInit {
  appointmentType: 'physical' | 'virtual' = 'physical';
  selectedDate: Date | null = null;
  selectedTime: string | null = null;
  currentMonth = new Date();
  weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  // Get today's date without time for comparison
  today = new Date();

  @Output() updatedForm = new EventEmitter<any>();

  dateForm = new FormGroup({
    type: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
    date: new FormControl<string | Date>('', {
      validators: [Validators.required],
    }),
    time: new FormControl<string | null>(null, {
      validators: [Validators.required],
    }),
  });

  constructor() {
    // Set today's date to start of day for proper comparison
    this.today.setHours(0, 0, 0, 0);

    this.dateForm.valueChanges.subscribe(() => {
      this.updatedForm.emit(this.dateForm);
    });
  }

  ngOnInit() {
    this.dateForm.controls.type.setValue(this.appointmentType);
  }

  setAppointmentType(type: 'physical' | 'virtual') {
    this.appointmentType = type;
    this.dateForm.controls.type.setValue(this.appointmentType);
  }

  selectDate(date: Date) {
    // Prevent selection of past dates
    if (this.isPastDate(date)) {
      return;
    }

    this.selectedDate = date;
    this.dateForm.controls.date.setValue(this.selectedDate);
  }

  selectTime(time: string) {
    this.selectedTime = time;
    this.dateForm.controls.time.setValue(this.selectedTime);
  }

  getDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  previousMonth() {
    const newMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);

    // Prevent navigating to months before current month
    if (
      newMonth.getFullYear() < this.today.getFullYear() ||
      (newMonth.getFullYear() === this.today.getFullYear() &&
        newMonth.getMonth() < this.today.getMonth())
    ) {
      return;
    }

    this.currentMonth = newMonth;
  }

  nextMonth() {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
  }

  isSelected(date: Date): boolean {
    return (
      this.selectedDate !== null &&
      date.getDate() === this.selectedDate.getDate() &&
      date.getMonth() === this.selectedDate.getMonth() &&
      date.getFullYear() === this.selectedDate.getFullYear()
    );
  }

  /**
   * Check if a date is in the past
   */
  isPastDate(date: Date): boolean {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < this.today;
  }

  /**
   * Check if navigation to previous month should be disabled
   */
  isPreviousMonthDisabled(): boolean {
    const prevMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    return (
      prevMonth.getFullYear() < this.today.getFullYear() ||
      (prevMonth.getFullYear() === this.today.getFullYear() &&
        prevMonth.getMonth() < this.today.getMonth())
    );
  }
}
