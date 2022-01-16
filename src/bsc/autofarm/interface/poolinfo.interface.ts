import { BigNumber } from "ethers";

export interface AutofarmPoolInfo {
    want: string;
    allocPoint: BigNumber;
    lastRewardBlock: BigNumber;
    accAUTOPerShare: BigNumber;
    strat: string;
    pairs?: any;
}