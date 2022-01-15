/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface MulticallAbiInterface extends utils.Interface {
  contractName: "MulticallAbi";
  functions: {
    "getCurrentBlockTimestamp()": FunctionFragment;
    "aggregate((address,bytes)[])": FunctionFragment;
    "getLastBlockHash()": FunctionFragment;
    "getEthBalance(address)": FunctionFragment;
    "getCurrentBlockDifficulty()": FunctionFragment;
    "getCurrentBlockGasLimit()": FunctionFragment;
    "getCurrentBlockCoinbase()": FunctionFragment;
    "getBlockHash(uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getCurrentBlockTimestamp",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "aggregate",
    values: [{ target: string; callData: BytesLike }[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getLastBlockHash",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getEthBalance",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentBlockDifficulty",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentBlockGasLimit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentBlockCoinbase",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getBlockHash",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "getCurrentBlockTimestamp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "aggregate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getLastBlockHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getEthBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentBlockDifficulty",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentBlockGasLimit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentBlockCoinbase",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBlockHash",
    data: BytesLike
  ): Result;

  events: {};
}

export interface MulticallAbi extends BaseContract {
  contractName: "MulticallAbi";
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MulticallAbiInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    getCurrentBlockTimestamp(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { timestamp: BigNumber }>;

    aggregate(
      calls: { target: string; callData: BytesLike }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getLastBlockHash(
      overrides?: CallOverrides
    ): Promise<[string] & { blockHash: string }>;

    getEthBalance(
      addr: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { balance: BigNumber }>;

    getCurrentBlockDifficulty(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { difficulty: BigNumber }>;

    getCurrentBlockGasLimit(
      overrides?: CallOverrides
    ): Promise<[BigNumber] & { gaslimit: BigNumber }>;

    getCurrentBlockCoinbase(
      overrides?: CallOverrides
    ): Promise<[string] & { coinbase: string }>;

    getBlockHash(
      blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string] & { blockHash: string }>;
  };

  getCurrentBlockTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

  aggregate(
    calls: { target: string; callData: BytesLike }[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getLastBlockHash(overrides?: CallOverrides): Promise<string>;

  getEthBalance(addr: string, overrides?: CallOverrides): Promise<BigNumber>;

  getCurrentBlockDifficulty(overrides?: CallOverrides): Promise<BigNumber>;

  getCurrentBlockGasLimit(overrides?: CallOverrides): Promise<BigNumber>;

  getCurrentBlockCoinbase(overrides?: CallOverrides): Promise<string>;

  getBlockHash(
    blockNumber: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    getCurrentBlockTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    aggregate(
      calls: { target: string; callData: BytesLike }[],
      overrides?: CallOverrides
    ): Promise<
      [BigNumber, string[]] & { blockNumber: BigNumber; returnData: string[] }
    >;

    getLastBlockHash(overrides?: CallOverrides): Promise<string>;

    getEthBalance(addr: string, overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentBlockDifficulty(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentBlockGasLimit(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentBlockCoinbase(overrides?: CallOverrides): Promise<string>;

    getBlockHash(
      blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {};

  estimateGas: {
    getCurrentBlockTimestamp(overrides?: CallOverrides): Promise<BigNumber>;

    aggregate(
      calls: { target: string; callData: BytesLike }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getLastBlockHash(overrides?: CallOverrides): Promise<BigNumber>;

    getEthBalance(addr: string, overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentBlockDifficulty(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentBlockGasLimit(overrides?: CallOverrides): Promise<BigNumber>;

    getCurrentBlockCoinbase(overrides?: CallOverrides): Promise<BigNumber>;

    getBlockHash(
      blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getCurrentBlockTimestamp(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    aggregate(
      calls: { target: string; callData: BytesLike }[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getLastBlockHash(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getEthBalance(
      addr: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentBlockDifficulty(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentBlockGasLimit(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getCurrentBlockCoinbase(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getBlockHash(
      blockNumber: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
