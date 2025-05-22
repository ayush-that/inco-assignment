import { Lightning } from "@inco/js/lite";

export const getZap = async () => {
  return Lightning.localNode();
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
