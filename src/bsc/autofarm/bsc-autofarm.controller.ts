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
        console.log('[INFO] updateCache() -- GET ')
        const pools = await this.service.getAllPoolInfo(true); 
        // Autofarm vaults has $AUTO rewards
        const rewards = await this.service.getTokenDetails(
            '0xa184088a740c695e156f91f5cc086a06bb78b827'
        ); 
        console.log('[INFO] updateCache() -- fetched pool infos ')

        
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
        console.log('[INFO] updateCache() -- Fetching additional token data')
        await Promise.allSettled(fetcher.flat());
        for await (const x of fetcher) {
            results[x[0]]['pairs'] = [
                await x[1], 
                await x[2],
            ]
        }
        console.log('[INFO] updateCache() -- Done')
        return results; 
    }
    
    @Get(':target')
    async getUserInfo(@Param('target') target: string){
        if (!ethers.utils.isAddress(target))
            throw new BadRequestException("Invalid address format or checksum");
        console.log('[INFO] getUserInfo() -- GET', target)
        const staked = await this.service.fetchStakedPools(target);
        const autoDetail = await this.service.getTokenDetails(
            '0xa184088a740c695e156f91f5cc086a06bb78b827'
        );
        console.log('[INFO] getUserInfo() -- Fetched user staked pools')
        
        const farms = [];
        for await(const x of staked){
            console.log('[INFO] getUserInfo() -- Fetching for', x.poolId);
            const pool   = await this.service.fetchOnePoolInfo(x.poolId);
            const token  = await this.service.getTokenDetails(pool.want);
            const reward = await this.service.fetchOneRewardDebt(x.poolId, target)

            console.log('[INFO] getUserInfo() -- Fetching additional token for', x.poolId);
            const res = { 
                tokens: token.type === 'lp' ? 
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
