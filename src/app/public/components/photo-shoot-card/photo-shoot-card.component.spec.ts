import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoShootCardComponent } from './photo-shoot-card.component';

describe('PhotoShootCardComponent', () => {
  let component: PhotoShootCardComponent;
  let fixture: ComponentFixture<PhotoShootCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoShootCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoShootCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
