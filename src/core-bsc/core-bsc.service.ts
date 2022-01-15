import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';

import { MULTICALL_ADDRESS, RPC_URL } from './config';
import MULTICALL_ABI from './abi/multicall';

@Injectable()
export class CoreBscService {
    private provider: JsonRpcProvider;
    private multicallInstance: ethers.Contract;

    constructor(){ 
        //TODO: make more dynamic, fall back etc.
        this.provider = new ethers.providers.JsonRpcProvider(
            RPC_URL[0]
        );
        this.multicallInstance = new ethers.Contract( 
            MULTICALL_ADDRESS, MULTICALL_ABI, this.provider
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
    getMulticallInstance(){ 
        return this.multicallInstance;
    }
}
