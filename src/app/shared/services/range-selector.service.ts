import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RangeSelectorService {
  private activeRangeSelectorId = new BehaviorSubject<string | null>(null);
  public activeRangeSelector$ = this.activeRangeSelectorId.asObservable();

  setActiveRangeSelector(id: string | null): void {
    console.log('🔧 Service: Setting active range selector to:', id);
    console.log('🔧 Service: Previous active was:', this.activeRangeSelectorId.value);
    this.activeRangeSelectorId.next(id);
  }

  getActiveRangeSelector(): string | null {
    return this.activeRangeSelectorId.value;
  }
}
