import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagnifyingGlassLocationIconComponent } from './magnifying-glass-location-icon.component';

describe('MagnifyingGlassLocationIconComponent', () => {
  let component: MagnifyingGlassLocationIconComponent;
  let fixture: ComponentFixture<MagnifyingGlassLocationIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MagnifyingGlassLocationIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagnifyingGlassLocationIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
