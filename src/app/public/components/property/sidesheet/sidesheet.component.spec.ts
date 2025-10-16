import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidesheetBookAppointmentComponent } from './sidesheet.component';

describe('SidesheetBookAppointmentComponent', () => {
  let component: SidesheetBookAppointmentComponent;
  let fixture: ComponentFixture<SidesheetBookAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidesheetBookAppointmentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SidesheetBookAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
