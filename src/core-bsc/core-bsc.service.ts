import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { JsonFragment } from '@ethersproject/abi';
import { 
    Contract as MulticallContract, 
    ContractCall, 
    Provider as MulticallProvider 
} from 'ethers-multicall';  
import { RPC_URL } from './config';
import { TokenInfo } from './interface/token.interface';

@Injectable()
export class CoreBscService {
    private provider: JsonRpcProvider;
    private multicallInstance: MulticallProvider;
    private token: TokenInfo;
    
    constructor(){ 
        this.getProvider();
        this.getMulticallInstance();
    }

    getProvider(){ 
        if( !this.provider ) 
            this.setProvider(new ethers.providers.JsonRpcProvider(
                RPC_URL[0]
            ))
        return this.provider; 
    }
    setProvider(newProvider: JsonRpcProvider){ 
        this.provider = newProvider; 
    }
    getContractInstance(address:string, abi:ethers.ContractInterface){ 
        return new ethers.Contract(address,abi,this.getProvider()); 
    }

/*
 *  Tokens Related Functionalities (ERC20/LP)
 */     
    private async fetchTokenDetails(address:string){
        //TODO: refactor to config.ts
        const res = await fetch(`https://api.pancakeswap.info/api/tokens/${address}`);
        if (!res.ok)
            return undefined
        return res.json();
    }
    async getTokenDetails(address: string, forceUpdate: boolean = false){
        //TODO: add stale refetch from updated_at 
        if( !this.token[address] || forceUpdate ){ 
            this.token[address] = await this.fetchTokenDetails(address); 
        }
        return this.token[address];
    }


/*
 *  Multicall Related Functionalities
 */ 
    async getMulticallInstance(): Promise<MulticallProvider> {
        if( !this.multicallInstance ){
            this.multicallInstance = new MulticallProvider(this.provider);
            await this.multicallInstance.init();
        }
        return this.multicallInstance;
    }
    getMulticallContractInstance(address:string, abi:JsonFragment[]) { 
        return new MulticallContract(address, abi); 
    }
    async multicall(calls: ContractCall[]){ 
        return await (await this.getMulticallInstance()).all(calls);
    }

   /* 
    * batchCalls() use multicall to fetch data from same target address
    * with different functions and inputs
    */
    async batchCallsTo(address:string, abi:JsonFragment[], calls:{call:string,inputs:any}[]) {
        const target = this.getMulticallContractInstance(address, abi); 
        const results = await this.multicall(calls.map(
            ({call, inputs}) => target[call](inputs)
        ));
        return results;
    }
    

}
