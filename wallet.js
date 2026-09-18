import { createAppKit } from '@reown/appkit';
import { mainnet } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

const projectId = '36ca0c4456b56fb5f98584d1d736e7ae';

const metadata = {
  name: 'Laki Token Ecosystem',
  description: 'Laki Token Ecosystem — BVM · UNO · TVO',
  url: 'https://bilugahaits-lab.github.io/Laki-BVM/',
  icons: [
    'https://bilugahaits-lab.github.io/Laki-BVM/logo-bvm.png'
  ]
};

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
// ЕЛЕМЕНТИ САЙТУ
// ============================================================

const connectButton =
  document.getElementById('connectWalletButton');

const disconnectButton =
  document.getElementById('disconnectWalletButton');

const walletStatus =
  document.getElementById('walletStatus');


// ============================================================
// СКОРОЧЕННЯ АДРЕСИ
// ============================================================

function shortAddress(address) {

  if (!address) {
    return '';
  }

  return (
    address.slice(0, 6) +
    '...' +
    address.slice(-4)
  );
}


// ============================================================
// ГАМАНЕЦЬ НЕ ПІДКЛЮЧЕНИЙ
// ============================================================

function showDisconnected() {

  if (connectButton) {
    connectButton.hidden = false;
  }

  if (disconnectButton) {
    disconnectButton.hidden = true;
  }

  if (walletStatus) {
    walletStatus.hidden = true;
    walletStatus.textContent = '';
  }
}


// ============================================================
// ГАМАНЕЦЬ ПІДКЛЮЧЕНИЙ
// ============================================================

function showConnected(address) {

  if (connectButton) {
    connectButton.hidden = true;
  }

  if (disconnectButton) {
    disconnectButton.hidden = false;
  }

  if (walletStatus) {

    walletStatus.hidden = false;

    walletStatus.textContent =
      'Підключено: ' +
      shortAddress(address) +
      ' · Ethereum Mainnet';
  }
}


// ============================================================
// ПІДКЛЮЧЕННЯ
// ============================================================

if (connectButton) {

  connectButton.addEventListener(
    'click',
    () => {

      modal.open();

    }
  );
}


// ============================================================
// ВІДСТЕЖЕННЯ СТАНУ REOWN
// ============================================================

modal.subscribeAccount((account) => {

  if (
    account &&
    account.isConnected &&
    account.address
  ) {

    showConnected(
      account.address
    );

  } else {

    showDisconnected();

  }

});


// ============================================================
// ВІДКЛЮЧЕННЯ
// ============================================================

if (disconnectButton) {

  disconnectButton.addEventListener(
    'click',
    async () => {

      try {

        await modal.disconnect();

        showDisconnected();

      } catch (error) {

        console.error(
          'Wallet disconnect error:',
          error
        );

      }

    }
  );
}


export { modal };
