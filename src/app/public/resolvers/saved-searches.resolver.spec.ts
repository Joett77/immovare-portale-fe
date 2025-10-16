import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { savedSearchesResolver } from './saved-searches.resolver';

describe('savedSearchesResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => savedSearchesResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
