import { Lightning } from "@inco/js/lite";

export const getZap = async () => {
  try {
    console.log("Initializing Inco Lightning local node...");
    const zap = await Lightning.localNode();
    console.log("Lightning node initialized successfully");
    return zap;
  } catch (error) {
    console.error("Error initializing Lightning node:", error);
    throw new Error(`Failed to initialize Inco Lightning: ${error.message}`);
  }
};

export const encryptValue = async (value, accountAddress, dappAddress) => {
  try {
    console.log(`Encrypting value for ${accountAddress} on ${dappAddress}...`);
    const zap = await getZap();
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

export const decryptValue = async (handle, walletClient) => {
  try {
    console.log("Decrypting handle:", handle);
    if (!handle || handle === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      throw new Error("Invalid handle or no value submitted yet");
    }

    const zap = await getZap();
    const reencryptor = await zap.getReencryptor(walletClient);
    const result = await reencryptor({ handle });
    console.log("Decryption successful:", result);
    return result;
  } catch (error) {
    console.error("Error decrypting value:", error);
    throw new Error(`Decryption failed: ${error.message}`);
  }
};
