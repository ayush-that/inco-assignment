import { Lightning } from "@inco/js/lite";
import { supportedChains } from "@inco/js";

export const getZap = async () => {
  const chainId = supportedChains.anvil;
  return Lightning.latest("local", chainId);
};

export const encryptValue = async (value, accountAddress, dappAddress) => {
  const zap = await getZap();
  return zap.encrypt(value, {
    accountAddress,
    dappAddress,
  });
};

export const decryptValue = async (handle, walletClient) => {
  const zap = await getZap();
  const reencryptor = await zap.getReencryptor(walletClient);
  return reencryptor({ handle });
};
