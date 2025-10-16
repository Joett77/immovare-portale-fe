import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepExtraFeaturesComponent } from './step-extra-features.component';

describe('StepExtraFeaturesComponent', () => {
  let component: StepExtraFeaturesComponent;
  let fixture: ComponentFixture<StepExtraFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepExtraFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StepExtraFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
