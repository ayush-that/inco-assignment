# 🚤 Millionaire's Dilemma: Yacht Edition

**A Privacy-Preserving Wealth Comparison dApp built with Inco Lightning**

> *Alice, Bob, and Eve are millionaires who want to figure out who's the richest without revealing their wealth to each other or anyone else.*

[![Tests](https://img.shields.io/badge/tests-7%2F7%20passing-brightgreen)]()
[![Solidity](https://img.shields.io/badge/solidity-^0.8.0-blue)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Inco Lightning](https://img.shields.io/badge/Inco%20Lightning-v0.1.30-purple)]()

## 🎯 **Project Overview**

This project implements a confidential smart contract solution to the classic "Millionaire's Problem" using **Inco Lightning's** Trusted Execution Environment (TEE) technology. Three participants can privately submit their wealth values and determine who is the richest without revealing actual amounts to each other or to the public.

### **Key Features**

- 🔐 **End-to-End Privacy**: Wealth values are encrypted client-side and never exposed
- ⚡ **Lightning Fast**: Built on Inco Lightning for optimized encrypted computations
- 🛡️ **Production Security**: Comprehensive error handling and access control
- 🎮 **Interactive UI**: Beautiful pixel-art themed frontend with real-time updates
- 🧪 **Thoroughly Tested**: 7/7 test coverage including edge cases and security scenarios

---

## 🏗️ **Architecture**

### **Smart Contract (`MillionaireDilemma.sol`)**

```
┌─────────────────────────────────────────────────────────────┐
│                    MillionaireDilemma                       │
├─────────────────────────────────────────────────────────────┤
│ • Participants: Alice, Bob, Eve (immutable addresses)       │
│ • Encrypted Storage: euint256 wealth mappings              │
│ • Access Control: Role-based permissions                   │
│ • Reentrancy Protection: Comprehensive safety measures     │
│ • Event System: Real-time updates for frontend             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Inco Lightning TEE Network                     │
├─────────────────────────────────────────────────────────────┤
│ • Encrypted Computation: Compare without revealing         │
│ • Decryption Callbacks: Async result processing           │
│ • Access Control Lists: Permission management             │
└─────────────────────────────────────────────────────────────┘
```

### **Frontend Architecture**

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   WalletConnect  │ ◄──┤   Main App       │──► │  Inco Lightning  │
│   Integration    │    │   (Next.js)      │    │   Encryption     │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
        ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼──────┐
        │  Wealth      │ │   Wealth    │ │  Contract  │
        │ Submission   │ │ Comparison  │ │ Integration│
        │ Component    │ │ Component   │ │  (Wagmi)   │
        └──────────────┘ └─────────────┘ └────────────┘
```

---

## 🚀 **Quick Start**

### **Prerequisites**

- [Bun](https://bun.sh/) or Node.js 18+
- [Docker](https://docker.com/) (for local testing)
- [Foundry](https://getfoundry.sh/) (for smart contract development)

### **1. Clone & Install**

```bash
git clone https://github.com/your-repo/lightning-rod.git
cd lightning-rod
bun install
```

### **2. Start Local Development Environment**

```bash
# Start local Inco Lightning node and covalidator
docker compose up -d

# Compile smart contracts
cd contracts && bun run test

# Start frontend development server
cd ../frontend && bun dev
```

### **3. Access the Application**

- **Frontend**: `http://localhost:3000`
- **Smart Contracts**: Deployed to local chain (Chain ID: 31337)

---

## 🔒 **Security Features**

### **Smart Contract Security**

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Access Control** | `onlyParticipants` modifier | Only Alice, Bob, Eve can submit |
| **Reentrancy Protection** | Custom `nonReentrant` modifier | Prevents reentrancy attacks |
| **Input Validation** | Empty data checks | Prevents malformed submissions |
| **State Management** | Immutable participants | Prevents address manipulation |
| **Duplicate Prevention** | `AlreadySubmitted` checks | Prevents multiple submissions |
| **Comparison Safety** | `ComparisonAlreadyCompleted` | Prevents replay attacks |

### **Frontend Security**

| Feature | Implementation | Purpose |
|---------|---------------|---------|
| **Input Validation** | Client-side validation | Prevents invalid wealth values |
| **Error Boundaries** | Comprehensive error handling | Graceful failure management |
| **Transaction Safety** | Timeout handling | Prevents stuck transactions |
| **State Protection** | Protected state updates | Prevents race conditions |
| **User Feedback** | Real-time status updates | Clear security communication |

### **Privacy Guarantees**

- ✅ **Wealth values never leave encrypted form**
- ✅ **Only final winner is revealed**
- ✅ **No intermediate calculations exposed**
- ✅ **Client-side encryption before transmission**
- ✅ **TEE-based secure computation**

---

## 🧪 **Testing**

### **Smart Contract Tests**

```bash
cd contracts
bun run test
```

**Test Coverage:**
- ✅ `testAliceIsRichest()` - Alice wins scenario
- ✅ `testBobIsRichest()` - Bob wins scenario  
- ✅ `testEveIsRichest()` - Eve wins scenario
- ✅ `testSubmitWealthUnauthorized()` - Access control
- ✅ `testCannotSubmitTwice()` - Duplicate prevention
- ✅ `testCannotCompareWithoutAllSubmissions()` - State validation
- ✅ `testCannotCompareAfterCompletion()` - Replay protection

### **Security Test Results**

```
Ran 7 tests for TestMillionaireDilemma
[PASS] testAliceIsRichest() (gas: 859173)
[PASS] testBobIsRichest() (gas: 859120)
[PASS] testCannotCompareAfterCompletion() (gas: 856854)
[PASS] testCannotCompareWithoutAllSubmissions() (gas: 276408)
[PASS] testCannotSubmitTwice() (gas: 168314)
[PASS] testEveIsRichest() (gas: 839415)
[PASS] testSubmitWealthUnauthorized() (gas: 10159)
Suite result: ok. 7 passed; 0 failed; 0 skipped
```

---

## 💻 **Usage Guide**

### **For Participants (Alice, Bob, Eve)**

1. **Connect Wallet**: Click "Connect Wallet" and connect with participant address
2. **Submit Wealth**: Enter your wealth value and click "Submit Encrypted Wealth"
3. **Wait for Others**: System shows status of all participants
4. **Compare**: Once all submitted, click "Compare Wealth Privately"
5. **View Result**: Winner is revealed without exposing actual amounts

### **For Observers**

1. **Connect Wallet**: Connect with any non-participant address
2. **View Status**: Monitor submission progress
3. **Trigger Comparison**: Can initiate comparison once all participants submit
4. **See Winner**: View final result

### **Wallet Setup**

**Participant Addresses (Local Development):**
```
Alice: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Bob:   0x70997970C51812dc3A010C7d01b50e0d17dc79C8  
Eve:   0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

---

## 🛠️ **Technical Implementation**

### **Encrypted Data Types**

```solidity
import {euint256, ebool, e} from "@inco/lightning/src/Lib.sol";

contract MillionaireDilemma {
    using e for *;
    
    mapping(address => euint256) public wealth;  // Encrypted wealth storage
    mapping(address => bool) public submitted;   // Submission tracking
}
```

### **Privacy-Preserving Comparison**

```solidity
function compare() external comparisonNotDone nonReentrant {
    // Encrypted comparison without revealing values
    euint256 bestWealth = wealth[eve];
    euint256 bestIdx = e.asEuint256(2);
    
    // Compare Bob vs current best
    ebool bobGeBest = wealth[bob].ge(bestWealth);
    bestWealth = bobGeBest.select(wealth[bob], bestWealth);
    bestIdx = bobGeBest.select(e.asEuint256(1), bestIdx);
    
    // Compare Alice vs current best  
    ebool aliceGeBest = wealth[alice].ge(bestWealth);
    bestIdx = aliceGeBest.select(e.asEuint256(0), bestIdx);
    
    // Request decryption of winner index only
    bestIdx.requestDecryption(this.handleResult.selector, "");
}
```

### **Frontend Encryption**

```javascript
import { Lightning } from "@inco/js/lite";

const encryptValue = async (value, accountAddress, dappAddress) => {
  const zap = await Lightning.localNode();
  const ciphertext = await zap.encrypt(value, {
    accountAddress,
    dappAddress,
  });
  return ciphertext;
};
```

---

## 📁 **Project Structure**

```
lightning-rod/
├── contracts/                 # Smart contract development
│   ├── src/
│   │   ├── MillionaireDilemma.sol    # Main contract
│   │   └── test/
│   │       └── TestMillionaireDilemma.t.sol
│   ├── foundry.toml
│   └── remappings.txt
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── millionaire-dilemma.js
│   │   │   ├── wealth-submission.js
│   │   │   └── wealth-comparison.js
│   │   ├── utils/
│   │   │   └── inco.js        # Encryption utilities
│   │   └── app/
│   │       └── page.js        # Main application page
│   ├── package.json
│   └── next.config.mjs
├── backend/                   # Backend services (minimal)
├── docker-compose.yaml        # Local development environment
└── README.md
```

---

## ⚠️ **Security Considerations**

### **Potential Attack Vectors & Mitigations**

| Attack Vector | Mitigation | Implementation |
|---------------|------------|----------------|
| **Reentrancy** | `nonReentrant` modifier | Custom reentrancy guard |
| **Access Control** | Role-based permissions | `onlyParticipants` modifier |
| **Replay Attacks** | State tracking | `_emitted` flag protection |
| **Input Manipulation** | Validation | Empty data checks |
| **Frontrunning** | Encrypted values | Client-side encryption |
| **MEV Attacks** | Private computation | TEE-based processing |

### **Data Leakage Prevention**

- ❌ **NO** raw wealth values stored on-chain
- ❌ **NO** intermediate comparison results exposed  
- ❌ **NO** participant wealth rankings revealed
- ✅ **ONLY** final winner address is disclosed
- ✅ **ALL** computations performed in encrypted domain

---

## 🚧 **Known Limitations**

1. **Participant Set**: Fixed to exactly 3 participants (Alice, Bob, Eve)
2. **Comparison Timing**: Requires all participants to submit before comparison
3. **Network Dependency**: Requires Inco Lightning network availability
4. **Gas Costs**: Encrypted operations have higher gas costs than regular operations

---

## 🔧 **Deployment**

### **Local Deployment (Testing)**

```bash
# Deploy to local chain
cd contracts
forge script script/Deploy.s.sol --broadcast --rpc-url http://localhost:8545
```

### **Testnet Deployment (Base Sepolia)**

```bash
# Deploy to Base Sepolia testnet
forge script script/Deploy.s.sol --broadcast --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### **Environment Variables**

```env
# .env.local
PRIVATE_KEY_ANVIL="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
PRIVATE_KEY_BASE_SEPOLIA="your_private_key_here"
LOCAL_CHAIN_RPC_URL="http://localhost:8545"
BASE_SEPOLIA_RPC_URL="https://base-sepolia-rpc.publicnode.com"
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`bun test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **[Inco Network](https://inco.org/)** - For providing the confidential computing infrastructure
- **[Foundry](https://getfoundry.sh/)** - For the excellent development toolkit
- **[Next.js](https://nextjs.org/)** - For the frontend framework
- **[Wagmi](https://wagmi.sh/)** - For Web3 React hooks

---

## 📞 **Support**

For questions or support:

- 📧 **Email**: [your-email@example.com]
- 💬 **Discord**: [Your Discord]
- 🐦 **Twitter**: [@your-twitter]

---

**🎉 Ready to solve the Millionaire's Dilemma? Clone the repo and start building!**