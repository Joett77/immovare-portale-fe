import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PalaceIconComponent } from './palace-icon.component';

describe('PalaceIconComponent', () => {
  let component: PalaceIconComponent;
  let fixture: ComponentFixture<PalaceIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PalaceIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PalaceIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
