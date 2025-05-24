import { Lightning } from "@inco/js/lite";

// initialize inco lightning
export const getZap = async (chainId = 31337) => {
  try {
    let zap;
    if (chainId === 31337) {
      zap = await Lightning.localNode();
    } else {
      throw new Error("Unsupported chain ID");
    }
    return zap;
  } catch (error) {
    console.error("Error initializing Lightning node:", error);
    throw new Error(`Failed to initialize Inco Lightning: ${error.message}`);
  }
};

// encrypt plaintext value to ciphertext
export const encryptValue = async (value, accountAddress, dappAddress, chainId = 31337) => {
  try {
    const zap = await getZap(chainId);
    const ciphertext = await zap.encrypt(value, {
      accountAddress,
      dappAddress,
    });
    return ciphertext;
  } catch (error) {
    console.error("Error encrypting value:", error);
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

export const decryptValue = async (handle, walletClient, chainId = 31337) => {
  try {
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
