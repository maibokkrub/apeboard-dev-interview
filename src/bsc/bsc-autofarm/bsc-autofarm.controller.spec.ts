import { Test, TestingModule } from '@nestjs/testing';
import { BscAutofarmController } from './bsc-autofarm.controller';

describe('BscAutofarmController', () => {
  let controller: BscAutofarmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BscAutofarmController],
    }).compile();

    controller = module.get<BscAutofarmController>(BscAutofarmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
