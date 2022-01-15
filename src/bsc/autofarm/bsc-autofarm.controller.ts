import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ethers } from 'ethers';
import { BscAutofarmService } from './bsc-autofarm.service';

@Controller('autofarm')
export class BscAutofarmController {
    constructor(
        private service: BscAutofarmService,
    ){};

    @Get('cache/update')
    updateCache(){ 
        return 'not implemented!';
    }
    
    @Get(':target')
    getData(@Param('target') target: string){
        if (!ethers.utils.isAddress(target))
            throw new BadRequestException("Invalid address format or checksum");
        return {address:target}; 
    }
}
