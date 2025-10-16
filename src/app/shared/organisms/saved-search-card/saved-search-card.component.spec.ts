import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedSearchCardComponent } from './saved-search-card.component';

describe('SavedSearchCardComponent', () => {
  let component: SavedSearchCardComponent;
  let fixture: ComponentFixture<SavedSearchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedSearchCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedSearchCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
