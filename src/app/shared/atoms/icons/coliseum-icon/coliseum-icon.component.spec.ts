import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColiseumIconComponent } from './coliseum-icon.component';

describe('ColiseumIconComponent', () => {
  let component: ColiseumIconComponent;
  let fixture: ComponentFixture<ColiseumIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColiseumIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColiseumIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
