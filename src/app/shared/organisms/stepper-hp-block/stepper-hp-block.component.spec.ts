import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperHpBlockComponent } from './stepper-hp-block.component';

describe('StepperHpBlockComponent', () => {
  let component: StepperHpBlockComponent;
  let fixture: ComponentFixture<StepperHpBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperHpBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepperHpBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
