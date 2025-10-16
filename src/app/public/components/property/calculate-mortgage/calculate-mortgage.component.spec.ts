import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateMortageComponent } from './calculate-mortgage.component';

describe('CalculateMortageComponent', () => {
  let component: CalculateMortageComponent;
  let fixture: ComponentFixture<CalculateMortageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculateMortageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculateMortageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
