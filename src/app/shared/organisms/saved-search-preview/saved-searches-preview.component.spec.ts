import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedSearchesPreviewComponent } from './saved-searches-preview.component';

describe('SavedSearchPreviewComponent', () => {
  let component: SavedSearchesPreviewComponent;
  let fixture: ComponentFixture<SavedSearchesPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavedSearchesPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedSearchesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
