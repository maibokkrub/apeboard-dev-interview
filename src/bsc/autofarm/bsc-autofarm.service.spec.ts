import { Test, TestingModule } from '@nestjs/testing';
import { BscAutofarmService } from './bsc-autofarm.service';

describe('BscAutofarmService', () => {
  let service: BscAutofarmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BscAutofarmService],
    }).compile();

    service = module.get<BscAutofarmService>(BscAutofarmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
