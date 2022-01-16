import { Injectable } from '@nestjs/common';
import { BigNumber, ethers } from 'ethers';

import { AutofarmAbi as AutofarmContract, ERC20Abi, UniswapV2pairAbi } from 'types/ethers-contracts';
import { CoreBscService } from 'src/core-bsc/core-bsc.service';
import { AutofarmPoolInfo } from './interface/poolinfo.interface';

import * as AUTOFARM_ABI from './abi/autofarm.abi.json';
import * as IUniswapV2Pair_ABI from "../../core-bsc/abi/UniswapV2pair.abi.json";
import * as ERC20Token_ABI from "../../core-bsc/abi/ERC20.abi.json";

@Injectable()
export class BscAutofarmService {
    private autofarmInstance: AutofarmContract;
    private maxPoolID: number;
    private poolInfos = [];

    constructor(
        private bsc: CoreBscService,
    ){
        this.initializeService();
    };

    private async initializeService(){ 
        this.autofarmInstance = this.bsc.getContractInstance(
            '0x0895196562C7868C5Be92459FaE7f877ED450452', 
            AUTOFARM_ABI
        ) as AutofarmContract;
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
     */
    async fetchAllPoolInfos(forceUpdate:boolean = false) { 
        // Hackily, use Autofarm's frontend datasource at 
        // https://static.autofarm.network/bsc/farm_data.json

        if( forceUpdate || !this.poolInfos ){
            await this.getMaxPoolID();
            const res = await this.bsc.batchCallsTo(
                this.autofarmInstance.address, 
                AUTOFARM_ABI,
                [...Array(this.maxPoolID).keys()].map( i => Object({ 
                    call: 'poolInfo', 
                    inputs: BigNumber.from(i),
                }))
            )
            //TODO: Fix
            const poolCalls = res.map(async x => this.bsc.getTokenDetails(x.want)) as any[];
            const pool      = await Promise.allSettled(poolCalls) as PromiseFulfilledResult<any>[];

            //TODO: process pool strats and add detail to poolInfo
            this.poolInfos = res.map((info,i) => Object({
                ...info, 
                pairs: pool[i].value || 'CALL_ERR', 
            }))
            // this.poolInfos = res;
        }
        return this.poolInfos;
    }
}
