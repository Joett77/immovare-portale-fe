import { TestBed } from '@angular/core/testing';

import { PlanAndServiceService } from './plan-and-service.service';

describe('PlanAndServiceService', () => {
  let service: PlanAndServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanAndServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
