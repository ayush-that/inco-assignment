import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

const contractAddress = '0x1fA02b2d6A771842690194Cf62D91bdd92BfE28d';
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
