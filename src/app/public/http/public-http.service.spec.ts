import { TestBed } from '@angular/core/testing';

import { PublicHttpService } from './public-http.service';

describe('PublicHttpService', () => {
  let service: PublicHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
