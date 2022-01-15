import { Test, TestingModule } from '@nestjs/testing';
import { CoreBscController } from './core-bsc.controller';

describe('CoreBscController', () => {
  let controller: CoreBscController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoreBscController],
    }).compile();

    controller = module.get<CoreBscController>(CoreBscController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
