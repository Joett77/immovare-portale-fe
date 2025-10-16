import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuomoIconComponent } from './duomo-icon.component';

describe('DuomoIconComponent', () => {
  let component: DuomoIconComponent;
  let fixture: ComponentFixture<DuomoIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuomoIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuomoIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
