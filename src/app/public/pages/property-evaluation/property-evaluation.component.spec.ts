import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyEvaluationComponent } from './property-evaluation.component';

describe('PropertyEvaluationComponent', () => {
  let component: PropertyEvaluationComponent;
  let fixture: ComponentFixture<PropertyEvaluationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyEvaluationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PropertyEvaluationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
