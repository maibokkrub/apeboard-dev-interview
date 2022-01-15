import { Test, TestingModule } from '@nestjs/testing';
import { CoreBscService } from './core-bsc.service';

describe('CoreBscService', () => {
  let service: CoreBscService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoreBscService],
    }).compile();

    service = module.get<CoreBscService>(CoreBscService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
