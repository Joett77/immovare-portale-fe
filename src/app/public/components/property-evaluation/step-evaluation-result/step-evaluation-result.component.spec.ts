import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepEvaluationResultComponent } from './step-evaluation-result.component';

describe('StepEvaluationResultComponent', () => {
  let component: StepEvaluationResultComponent;
  let fixture: ComponentFixture<StepEvaluationResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepEvaluationResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepEvaluationResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
