import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CastelIconComponent } from './castel-icon.component';

describe('CastelIconComponent', () => {
  let component: CastelIconComponent;
  let fixture: ComponentFixture<CastelIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CastelIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CastelIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
