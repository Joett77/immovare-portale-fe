import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogTagFilterComponent } from './blog-tag-filter.component';

describe('BlogTagFilterComponent', () => {
  let component: BlogTagFilterComponent;
  let fixture: ComponentFixture<BlogTagFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogTagFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogTagFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
