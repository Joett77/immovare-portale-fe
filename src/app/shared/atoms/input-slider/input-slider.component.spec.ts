import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputSliderComponent } from './input-slider.component';

describe('InputSliderComponent', () => {
  let component: InputSliderComponent;
  let fixture: ComponentFixture<InputSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputSliderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
