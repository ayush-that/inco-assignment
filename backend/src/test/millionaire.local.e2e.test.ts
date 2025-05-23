import { loadDotEnv } from '../repo';
import { Lightning } from '@inco/js/lite';
import { anvil } from 'viem/chains';
import { createWalletClient, createPublicClient, getContract, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { beforeAll, describe, expect, it } from 'vitest';
import millionaireBuild from '../../../contracts/out/MillionaireDilemma.sol/MillionaireDilemma.json';
import { millionaireDilemmaAbi } from '../generated/abis';
import { HexString, parse } from '@inco/js';

interface E2EConfig {
  chainRpcUrl: string;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

describe('MillionaireDilemma Local E2E', () => {
  loadDotEnv();
  const zap = Lightning.localNode();
  const cfg: E2EConfig = { chainRpcUrl: 'http://127.0.0.1:8545' };

  let publicClient: ReturnType<typeof createPublicClient>;
  let dappAddress: Hex;

  const aliceKey = parse(HexString, getEnv('ALICE_PRIV_KEY'));
  const bobKey = parse(HexString, getEnv('BOB_PRIV_KEY'));
  const eveKey = parse(HexString, getEnv('EVE_PRIV_KEY'));

  const aliceAccount = privateKeyToAccount(aliceKey);
  const bobAccount = privateKeyToAccount(bobKey);
  const eveAccount = privateKeyToAccount(eveKey);

  beforeAll(async () => {
    const aliceWealth = BigInt(getEnv('ALICE_WEALTH'));
    const bobWealth = BigInt(getEnv('BOB_WEALTH'));
    const eveWealth = BigInt(getEnv('EVE_WEALTH'));

    publicClient = createPublicClient({
      chain: anvil,
      transport: http(cfg.chainRpcUrl),
    });

    const aliceClient = createWalletClient({
      chain: anvil,
      transport: http(cfg.chainRpcUrl),
      account: aliceAccount,
    });

    console.log('Deploying MillionaireDilemma contract...');
    const bytecode = parse(HexString, millionaireBuild.bytecode.object);
    const txHash = await aliceClient.deployContract({
      account: aliceAccount,
      abi: millionaireDilemmaAbi,
      bytecode,
      args: [aliceAccount.address, bobAccount.address, eveAccount.address],
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (!receipt.contractAddress) {
      throw new Error('Contract address not found in receipt');
    }
    dappAddress = receipt.contractAddress;
    console.log(`Contract deployed at ${dappAddress}`);

    const aliceWallet = createWalletClient({
      chain: anvil,
      transport: http(cfg.chainRpcUrl),
      account: aliceAccount,
    });
    const bobWallet = createWalletClient({
      chain: anvil,
      transport: http(cfg.chainRpcUrl),
      account: bobAccount,
    });
    const eveWallet = createWalletClient({
      chain: anvil,
      transport: http(cfg.chainRpcUrl),
      account: eveAccount,
    });

    console.log('Encrypting wealth values...');
    const aliceCt = await zap.encrypt(aliceWealth, {
      accountAddress: aliceAccount.address,
      dappAddress,
    });
    const bobCt = await zap.encrypt(bobWealth, {
      accountAddress: bobAccount.address,
      dappAddress,
    });
    const eveCt = await zap.encrypt(eveWealth, {
      accountAddress: eveAccount.address,
      dappAddress,
    });

    const aliceDapp = getContract({
      abi: millionaireDilemmaAbi,
      address: dappAddress,
      client: aliceWallet,
    });
    const bobDapp = getContract({
      abi: millionaireDilemmaAbi,
      address: dappAddress,
      client: bobWallet,
    });
    const eveDapp = getContract({
      abi: millionaireDilemmaAbi,
      address: dappAddress,
      client: eveWallet,
    });

    console.log('Submitting wealth values...');
    await aliceDapp.write.submitWealth([aliceCt]);
    await bobDapp.write.submitWealth([bobCt]);
    await eveDapp.write.submitWealth([eveCt]);

    console.log('Comparing wealth values...');
    await aliceDapp.write.compare();
  }, 120_000);

  it('should emit the richest participant', async () => {
    const dapp = getContract({
      abi: millionaireDilemmaAbi,
      address: dappAddress,
      client: publicClient,
    });

    console.log('Waiting for Richest event...');
    const richestEvent = await new Promise<Hex>((resolve) => {
      dapp.watchEvent.Richest(
        {},
        {
          onLogs: (logs) => {
            const log = logs[0];
            if (logs.length > 0 && log && log.args && typeof log.args.richest === 'string') {
              resolve(log.args.richest as Hex);
            }
          },
        },
      );
    });
    console.log(`Richest participant: ${richestEvent}`);

    const wealths = [
      { addr: aliceAccount.address, val: BigInt(getEnv('ALICE_WEALTH')) },
      { addr: bobAccount.address, val: BigInt(getEnv('BOB_WEALTH')) },
      { addr: eveAccount.address, val: BigInt(getEnv('EVE_WEALTH')) },
    ];
    const sortedWealths = [...wealths].sort((a, b) => (a.val > b.val ? -1 : 1));

    expect(richestEvent).toBe(sortedWealths[0]?.addr || '0x');
  }, 30_000);
});
