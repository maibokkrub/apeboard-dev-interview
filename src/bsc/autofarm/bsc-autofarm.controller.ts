import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ethers } from 'ethers';
import { BscAutofarmService } from './bsc-autofarm.service';

@Controller('autofarm')
export class BscAutofarmController {
    constructor(
        private service: BscAutofarmService,
    ){};

    @Get('cache/update')
    async updateCache(){
        const pools = await this.service.getAllPoolInfo(true); 
        // Autofarm vaults has $AUTO rewards
        const rewards = await this.service.getTokenDetails(
            '0xa184088a740c695e156f91f5cc086a06bb78b827'
        ); 
        
        const fetcher:any[][] = [] ;
        const results = []

        for(let i=0; i<pools.length; ++i){
            const pool = pools[i];
            const token = await this.service.getTokenDetails(pool.want);

            const res = { 
                poolId: i,
                type: token.type,
                stratsAddress: pool.strat,
                token,
                rewards,
            }
            try{
                if( token.type === 'lp' && token.token0 && token.token1 ){
                    fetcher.push([
                        i,
                        this.service.getTokenDetails(token.token0), 
                        this.service.getTokenDetails(token.token1),
                    ])
                }
            }
            catch(e){ 
                console.log(token, e)
            }  
            results.push(res); 
        }
        await Promise.allSettled(fetcher.flat());
        for await (const x of fetcher) {
            results[x[0]]['pairs'] = [
                await x[1], 
                await x[2],
            ]
        }
        return results; 
    }
    
    @Get(':target')
    async getData(@Param('target') target: string){
        if (!ethers.utils.isAddress(target))
            throw new BadRequestException("Invalid address format or checksum");
        const staked = await this.service.fetchStakedPools(target);
        const autoDetail = await this.service.getTokenDetails(
            '0xa184088a740c695e156f91f5cc086a06bb78b827'
        );
        
        const farms = [];
        for await(const x of staked){
            const pool   = await this.service.fetchOnePoolInfo(x.poolId);
            const token  = await this.service.getTokenDetails(pool.want);
            const reward = await this.service.fetchOneRewardDebt(x.poolId, target)

            const res = { 
                tokens: token.type === 'lp' && token.token0 && token.token1 ? 
                    [
                        await this.service.getTokenDetails(token.token0), 
                        await this.service.getTokenDetails(token.token1),
                    ]: 
                        token, 
                balance: reward.shares.toString(), 
                rewards: 
                reward?.rewardDebt?.isZero() ? [] : {
                        ...autoDetail, 
                        balance: reward.rewardDebt.toString(),
                },
                poolAddress: token.address,
            }
            farms.push(res); 
        }
        return { farms };
    }

    @Get('/token/:target')
    getToken(@Param('target') target: string){
        return this.service.getTokenDetails(target);
    }
}
