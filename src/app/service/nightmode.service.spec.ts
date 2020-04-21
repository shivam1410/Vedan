import { TestBed } from '@angular/core/testing';

import { NightmodeService } from './nightmode.service';

describe('NightmodeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NightmodeService = TestBed.get(NightmodeService);
    expect(service).toBeTruthy();
  });
});
