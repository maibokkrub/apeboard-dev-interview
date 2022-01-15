import { Injectable } from '@nestjs/common';
import { BigNumber, ethers, Wallet } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

import { MULTICALL_ADDRESS, RPC_URL } from './config';
import * as MULTICALL_ABI from './abi/multicall.abi.json';
import { MulticallAbi } from 'types/ethers-contracts';

@Injectable()
export class CoreBscService {
    private provider: JsonRpcProvider;
    private wallet: Wallet;
    private multicallInstance: ethers.Contract;
    private multicallGasLimit: number = 150000000; 
    
    constructor(){ 
        //TODO: make more dynamic, fall back etc.
        this.provider = new ethers.providers.JsonRpcProvider(
            RPC_URL[0]
        );
        this.wallet = ethers.Wallet.createRandom();
        this.multicallInstance = new ethers.Contract( 
            MULTICALL_ADDRESS, MULTICALL_ABI, this.wallet.connect(this.provider)
        ); 
    }
    
    /*
     *  Getters & Setters 
     */ 
    getProvider(){ 
        return this.provider; 
    }
    setProvider(newProvider: JsonRpcProvider){ 
        this.provider = newProvider; 
    }
    getContractInstance(address:string, abi:ethers.ContractInterface){ 
        return new ethers.Contract(address,abi, this.getProvider()); 
    }

    /*
     *  Multicall Related Functionalities
     */ 
    getMulticallInstance(): MulticallAbi { 
        return this.multicallInstance as MulticallAbi;
    }
    //TODO: proper typing for calls

    /*
    {
        target: this.autofarmInstance.address, 
        abi: this.autofarmInstance.interface, 
        name: 'poolInfo', 
        input: [i],
    }
    */
    async multiCalls(calls: any[]) { 
        const chunks = calls.reduce((all,one,i) => {
            const ch = Math.floor(i/3); 
            all[ch] = [].concat((all[ch]||[]),one); 
            return all
        }, []);
        
        const rawResults = chunks.map(async (chunk) => await this.getMulticallInstance()
            .aggregate(
                    chunk.map((call) => { 
                        return { 
                            target: call.target, 
                            callData: call.abi.encodeFunctionData(
                                call.name,
                                call.input
                            )
                        }
                    }), {
                        gasLimit: 150000000,
                    }
            )
        );
        await Promise.all(rawResults); 
        return chunks.map(
            (chunk,i) => chunk.map(
                (call,j) => call.abi.decodeFunctionData(call.name, rawResults[i][j])
            )
        );
    }
}
