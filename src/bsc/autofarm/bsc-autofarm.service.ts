import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';

import { CoreBscService } from 'src/core-bsc/core-bsc.service';
import { AutofarmAbi } from 'types/ethers-contracts';
import * as AUTOFARM_ABI from './abi/autofarm.abi.json';

@Injectable()
export class BscAutofarmService {
    private autofarmInstance: AutofarmAbi;
    private poolInfos: any;
    private maxPoolID: number;

    constructor(
        private bsc: CoreBscService,
    ){
        this.initializeService();
    };

    private async initializeService(){ 
        this.autofarmInstance = this.bsc.getContractInstance(
            '0x0895196562C7868C5Be92459FaE7f877ED450452', 
            AUTOFARM_ABI
        ) as AutofarmAbi;
        this.getPoolInfos(); 
    }

    private async getMaxPoolID(): Promise<number>{ 
        this.maxPoolID = (await this.autofarmInstance.poolLength()).toNumber();
        console.log("Max ID = ", this.maxPoolID); 
        return this.maxPoolID;
    }

    async getPoolInfos(forceUpdate:boolean = false): Promise<any>{ 
        if( forceUpdate || !this.poolInfos ){
            await this.getMaxPoolID();
            this.poolInfos = (await this.bsc.multiCalls(
                    [...Array(this.maxPoolID).keys()].map(
                        (i) => {
                            return {
                                target: this.autofarmInstance.address, 
                                abi: this.autofarmInstance.interface, 
                                name: 'poolInfo', 
                                input: [i],
                            }
                        }
                    )
                )
            )
        }
        return this.poolInfos;
        // return "hello";
    }

}
