import { createAppKit } from '@reown/appkit';
import { mainnet } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

// ============================================================
// REOWN / WALLETCONNECT
// ============================================================

const projectId = '36ca0c4456b56fb5f98584d1d736e7ae';

// ============================================================
// ДАНІ LAKI TOKEN ECOSYSTEM
// ============================================================

const metadata = {
  name: 'Laki Token Ecosystem',
  description: 'Laki Token Ecosystem — BVM · UNO · TVO',
  url: 'https://bilugahaits-lab.github.io/Laki-BVM/',
  icons: [
    'https://bilugahaits-lab.github.io/Laki-BVM/logo-bvm.png'
  ]
};

// ============================================================
// APPKIT
// ТІЛЬКИ ETHEREUM MAINNET
// ============================================================

const modal = createAppKit({
  adapters: [
    new EthersAdapter()
  ],

  networks: [
    mainnet
  ],

  defaultNetwork: mainnet,

  metadata,
  projectId,

  features: {
    analytics: true
  }
});

// ============================================================
// ЕКСПОРТ
// ============================================================

export { modal };
