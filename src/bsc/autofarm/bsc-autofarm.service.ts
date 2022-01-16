import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';

import { CoreBscService } from 'src/core-bsc/core-bsc.service';
import { AutofarmAbi } from 'types/ethers-contracts';
import * as AUTOFARM_ABI from './abi/autofarm.abi.json';
import { AutofarmPoolInfo } from './interface/poolinfo.interface';

@Injectable()
export class BscAutofarmService {
    private autofarmInstance: AutofarmAbi;
    private poolInfos: AutofarmPoolInfo[];
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
        this.fetchAllPoolInfos(); 
    }

    private async getMaxPoolID(): Promise<number>{ 
        this.maxPoolID = (await this.autofarmInstance.poolLength()).toNumber();
        return this.maxPoolID;
    }

    async fetchOnePoolInfo(id: number){ 
        return await this.autofarmInstance.poolInfo(BigNumber.from(id));
    }

    /*
     * fetchAllPoolInfos() fetches on-chain pool data details
     * automatically fetch token info from strats contract
     *   pool 99999 is native Autofarm's $AUTO
     */
    async fetchAllPoolInfos(forceUpdate:boolean = false) { 
        // Hackily, could use Autofarm's frontend datasource at 
        // https://static.autofarm.network/bsc/farm_data.json

        if( forceUpdate || !this.poolInfos ){
            await this.getMaxPoolID();
            this.poolInfos = await this.bsc.batchCallsTo(
                this.autofarmInstance.address, 
                AUTOFARM_ABI,
                [...Array(this.maxPoolID).keys(), 99999].map( i => Object({ 
                    call: 'poolInfo', 
                    inputs: BigNumber.from(i),
                }))
            )
        }
        return this.poolInfos;
    }

    /*
     * fetchAllPoolStrats() process poolInfo's strats 
     * and fetches token details according to Token's addresses
     */
    private async fetchAllPoolStrats(forceUpdate:boolean = false){ 

    }

}
