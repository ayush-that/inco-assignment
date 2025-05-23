import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen';

export const millionaireDilemmaAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_alice', internalType: 'address', type: 'address' },
      { name: '_bob', internalType: 'address', type: 'address' },
      { name: '_eve', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'alice',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'bob',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  { type: 'function', inputs: [], name: 'compare', outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'eve',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: 'decryptedIdx', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'handleResult',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'encryptedWealth', internalType: 'bytes', type: 'bytes' }],
    name: 'submitWealth',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'submitted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'wealth',
    outputs: [{ name: '', internalType: 'euint256', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [{ name: 'richest', internalType: 'address', type: 'address', indexed: true }],
    name: 'Richest',
  },
] as const;

export const millionaireDilemmaAddress = {
  31337: '0x5fbdb2315678afecb367f032d93f642f64180aa3', // Local network
} as const;

export const millionaireDilemmaConfig = { address: millionaireDilemmaAddress, abi: millionaireDilemmaAbi } as const;

export const useReadMillionaireDilemma = /*#__PURE__*/ createUseReadContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
});

export const useReadMillionaireDilemmaAlice = /*#__PURE__*/ createUseReadContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'alice',
});

export const useReadMillionaireDilemmaBob = /*#__PURE__*/ createUseReadContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'bob',
});

export const useReadMillionaireDilemmaEve = /*#__PURE__*/ createUseReadContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'eve',
});

export const useReadMillionaireDilemmaSubmitted = /*#__PURE__*/ createUseReadContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'submitted',
});

export const useReadMillionaireDilemmaWealth = /*#__PURE__*/ createUseReadContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'wealth',
});

export const useWriteMillionaireDilemma = /*#__PURE__*/ createUseWriteContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
});

export const useWriteMillionaireDilemmaCompare = /*#__PURE__*/ createUseWriteContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'compare',
});

export const useWriteMillionaireDilemmaSubmitWealth = /*#__PURE__*/ createUseWriteContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'submitWealth',
});

export const useSimulateMillionaireDilemma = /*#__PURE__*/ createUseSimulateContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
});

export const useSimulateMillionaireDilemmaCompare = /*#__PURE__*/ createUseSimulateContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'compare',
});

export const useSimulateMillionaireDilemmaSubmitWealth = /*#__PURE__*/ createUseSimulateContract({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  functionName: 'submitWealth',
});

export const useWatchMillionaireDilemmaEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
});

export const useWatchMillionaireDilemmaRichestEvent = /*#__PURE__*/ createUseWatchContractEvent({
  abi: millionaireDilemmaAbi,
  address: millionaireDilemmaAddress,
  eventName: 'Richest',
});
