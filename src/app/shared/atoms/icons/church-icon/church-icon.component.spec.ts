import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChurchIconComponent } from './church-icon.component';

describe('ChurchIconComponent', () => {
  let component: ChurchIconComponent;
  let fixture: ComponentFixture<ChurchIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChurchIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChurchIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
