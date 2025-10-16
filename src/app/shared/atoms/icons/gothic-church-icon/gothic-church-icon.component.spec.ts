import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GothicChurchIconComponent } from './gothic-church-icon.component';

describe('GothicChurchIconComponent', () => {
  let component: GothicChurchIconComponent;
  let fixture: ComponentFixture<GothicChurchIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GothicChurchIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GothicChurchIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
