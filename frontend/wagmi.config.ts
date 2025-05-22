import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

const contractAddress = '0x68B1D87F95878fE05B998F19b66F4baba5De1aed';
const chainId = 31337;

export default defineConfig({
  out: 'src/generated.ts',
  plugins: [
    foundry({
      project: '../contracts',
      include: ['MillionaireDilemma.sol/**'],
      deployments: {
        MillionaireDilemma: {
          [chainId]: contractAddress,
        },
      },
    }),
  ],
});
