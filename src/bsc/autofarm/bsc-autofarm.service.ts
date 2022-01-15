import { Injectable } from '@nestjs/common';
import { CoreBscService } from 'src/core-bsc/core-bsc.service';

@Injectable()
export class BscAutofarmService {
    constructor(
        private bsc: CoreBscService,
    ){};
}
