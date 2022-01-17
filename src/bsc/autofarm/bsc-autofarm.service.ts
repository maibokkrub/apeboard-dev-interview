import { Injectable } from '@nestjs/common';
import { BigNumber,  } from 'ethers';

import { AutofarmAbi as AutofarmContract, ERC20Abi, UniswapV2pairAbi } from 'types/ethers-contracts';
import { CoreBscService } from 'src/core-bsc/core-bsc.service';
import { AutofarmPoolInfo } from './interface/poolinfo.interface';

import * as AUTOFARM_ABI from './abi/autofarm.abi.json';

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
    }

    private async getMaxPoolID(): Promise<number>{ 
        this.maxPoolID = (await this.autofarmInstance.poolLength()).toNumber();
        return this.maxPoolID;
    }

    async getTokenDetails(address:string){ 
        if( !address )
            throw Error("getTokenDetails: Missing address");
        return await this.bsc.getTokenDetails(address);
    }

    async fetchOnePoolInfo(id: number){ 
        if( !this.poolInfos[id] ){
            const info = await this.autofarmInstance.poolInfo(BigNumber.from(id))
            this.poolInfos[id] = { 
                ...info,
                pairs: await this.bsc.getTokenDetails(info.want),
            }
        }
        return this.poolInfos[id]
    }
    async fetchOneRewardDebt(id: number, address:string){ 
        return this.autofarmInstance.userInfo(BigNumber.from(id), address);
    }

    /*
     * fetchAllPoolInfos() fetches on-chain pool data details
     * automatically fetch token info from strats contract
     * Alternatively, https://static.autofarm.network/bsc/farm_data.json
     */
    private async fetchAllPoolInfos() {
        await this.getMaxPoolID();
        const res = await this.bsc.batchCallsTo(
            this.autofarmInstance.address, 
            AUTOFARM_ABI,
            [...Array(this.maxPoolID).keys()].map( i => Object({ 
                call: 'poolInfo', 
                inputs: BigNumber.from(i),
            }))
        )

        const poolCalls = res.map(async x => this.bsc.getTokenDetails(x.want)) as any[];
        const pool      = await Promise.allSettled(poolCalls) as PromiseFulfilledResult<AutofarmPoolInfo>[];

        //TODO: process pool strats and add detail to poolInfo
        this.poolInfos = res.map((info,i) => Object({
            ...info,
            pairs: pool[i].value || 'CALL_ERR',
        }))
    }
    async getAllPoolInfo(forceUpdate:boolean = false) { 
        if( forceUpdate || !this.poolInfos ){
            await this.fetchAllPoolInfos();
        }
        return this.poolInfos;
    }
    
    async fetchStakedPools(wallet:string){ 
        const calls = [...Array(this.maxPoolID).keys()].map( 
            i => this.autofarmInstance.stakedWantTokens(
                BigNumber.from(i), wallet
            )
        )
        const res = await Promise.allSettled(calls) as PromiseFulfilledResult<BigNumber>[]
        return res.reduce(
            (prev, {value}, i) => (value && !value.isZero()) ? [...prev, Object({
                poolId: i, 
                balance: value, 
            })] : prev
        ,[])
    }
}
