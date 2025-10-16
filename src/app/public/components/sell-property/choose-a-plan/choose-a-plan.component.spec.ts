import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseAPlanComponent } from './choose-a-plan.component';

describe('ChooseAPlanComponent', () => {
  let component: ChooseAPlanComponent;
  let fixture: ComponentFixture<ChooseAPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseAPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseAPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
