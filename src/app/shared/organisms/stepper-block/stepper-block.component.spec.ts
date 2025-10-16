import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperBlockComponent } from './stepper-block.component';

describe('StepperBlockComponent', () => {
  let component: StepperBlockComponent;
  let fixture: ComponentFixture<StepperBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
