export const 
    RPC_URL = [
        'https://bsc-dataseed.binance.org/', 
        'https://bsc-dataseed1.defibit.io/',
        'https://bsc-dataseed1.ninicoin.io/', 
    ]; 

export const 
    MULTICALL_ADDRESS = 
        '0x41263cba59eb80dc200f3e2544eda4ed6a90e76c'; 

export const
    TOKENLIST_ENDPOINT: TokenList = { 
        pancake: `https://api.pancakeswap.info/api/v2/tokens`,
    }

export const
    PAIRLIST_ENDPOINT: TokenList = { 
        pancake: `https://api.pancakeswap.info/api/v2/pairs`,
    }

export const
    TOKEN_ENDPOINT: TokenList = { 
        pancake: `https://api.pancakeswap.info/api/v2/tokens/:address`, 
    }

interface TokenList { 
    [key:string]: string; 
}