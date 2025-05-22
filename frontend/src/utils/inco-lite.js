import { getAddress, formatUnits } from "viem";
import { Lightning } from "@inco/js/lite";

export const getConfig = () => {
  return Lightning.latest("testnet", 84532);
};

export const encryptValue = async ({ value, address, contractAddress }) => {
  const valueBigInt = BigInt(value);
  const checksummedAddress = getAddress(contractAddress);
  const incoConfig = await getConfig();
  const encryptedData = await incoConfig.encrypt(valueBigInt, {
    accountAddress: address,
    dappAddress: checksummedAddress,
  });

  console.log("Encrypted data:", encryptedData);

  return encryptedData;
};

export const reEncryptValue = async ({ walletClient, handle }) => {
  if (!walletClient || !handle) {
    throw new Error("Missing required parameters for creating reencryptor");
  }

  try {
    const incoConfig = await getConfig();
    const reencryptor = await incoConfig.getReencryptor(walletClient.data);

    const decryptedResult = await reencryptor({
      handle: handle.toString(),
    });

    console.log("Decrypted result:", decryptedResult);

    const decryptedEther = formatUnits(BigInt(decryptedResult.value), 18);
    const formattedValue = parseFloat(decryptedEther).toFixed(0);

    return formattedValue;
  } catch (error) {
    throw new Error(`Failed to create reencryptor: ${error.message}`);
  }
};
