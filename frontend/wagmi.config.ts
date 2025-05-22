import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

const contractAddress = '0x7ef8E99980Da5bcEDcF7C10f41E55f759F6A174B';
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
