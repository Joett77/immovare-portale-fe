import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritePropertyCardComponent } from './favorite-property-card.component';

describe('FavoritePropertyCardComponent', () => {
  let component: FavoritePropertyCardComponent;
  let fixture: ComponentFixture<FavoritePropertyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritePropertyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoritePropertyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
