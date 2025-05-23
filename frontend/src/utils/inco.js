import { Lightning } from "@inco/js/lite";
import { supportedChains } from "@inco/js";

export const getZap = async (chainId = 31337) => {
  try {
    console.log(`Initializing Inco Lightning for chain ${chainId}...`);

    let zap;
    if (chainId === 31337) {
      // Local network
      zap = await Lightning.localNode();
    } else if (chainId === 84532) {
      // Base Sepolia
      zap = Lightning.latest("testnet", supportedChains.baseSepolia);
    } else {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }

    console.log("Lightning node initialized successfully");
    return zap;
  } catch (error) {
    console.error("Error initializing Lightning node:", error);
    throw new Error(`Failed to initialize Inco Lightning: ${error.message}`);
  }
};

export const encryptValue = async (value, accountAddress, dappAddress, chainId = 31337) => {
  try {
    console.log(`Encrypting value for ${accountAddress} on ${dappAddress}...`);
    const zap = await getZap(chainId);
    const ciphertext = await zap.encrypt(value, {
      accountAddress,
      dappAddress,
    });
    console.log("Value encrypted successfully");
    return ciphertext;
  } catch (error) {
    console.error("Error encrypting value:", error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

export const decryptValue = async (handle, walletClient, chainId = 31337) => {
  try {
    console.log("Decrypting handle:", handle);
    if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      throw new Error("Invalid handle or no value submitted yet");
    }

    const zap = await getZap(chainId);
    const reencryptor = await zap.getReencryptor(walletClient);
    const result = await reencryptor({ handle });
    console.log("Decryption successful:", result);
    return result;
  } catch (error) {
    console.error("Error decrypting value:", error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};
