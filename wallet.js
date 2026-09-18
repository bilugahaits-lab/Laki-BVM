import { createAppKit } from '@reown/appkit';
import { mainnet } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import {
  BrowserProvider
} from 'ethers';


// ============================================================
// REOWN / WALLETCONNECT
// ============================================================

const projectId =
  '36ca0c4456b56fb5f98584d1d736e7ae';

const metadata = {
  name: 'Laki Token Ecosystem',

  description:
    'Laki Token Ecosystem — BVM · UNO · TVO',

  url:
    'https://bilugahaits-lab.github.io/Laki-BVM/',

  icons: [
    'https://bilugahaits-lab.github.io/Laki-BVM/logo-bvm.png'
  ]
};


// ============================================================
// SUPABASE EDGE FUNCTIONS
// ============================================================

const SUPABASE_FUNCTIONS_URL =
  'https://xbgjgzijlykgsjfsasoz.supabase.co/functions/v1';

const CREATE_NONCE_URL =
  `${SUPABASE_FUNCTIONS_URL}/create-wallet-nonce`;

const REGISTER_WALLET_URL =
  `${SUPABASE_FUNCTIONS_URL}/register-wallet`;


// ============================================================
// APPKIT
// ============================================================

const modal = createAppKit({
  adapters: [
    new EthersAdapter()
  ],

  networks: [
    mainnet
  ],

  defaultNetwork:
    mainnet,

  metadata,

  projectId,

  features: {
    analytics: true
  }
});


// ============================================================
// HTML ELEMENTS
// ============================================================

const connectButton =
  document.getElementById(
    'connectWalletButton'
  );

const disconnectButton =
  document.getElementById(
    'disconnectWalletButton'
  );

const walletStatus =
  document.getElementById(
    'walletStatus'
  );

const registerButton =
  document.getElementById(
    'registerWalletButton'
  );

const registrationStatus =
  document.getElementById(
    'registrationStatus'
  );

const registeredContent =
  document.getElementById(
    'registeredContent'
  );


// ============================================================
// CURRENT WALLET
// ============================================================

let currentAddress = null;


// ============================================================
// HELPERS
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


function resetRegistration() {
  if (registerButton) {
    registerButton.hidden = false;
    registerButton.disabled = false;
  }

  if (registrationStatus) {
    registrationStatus.hidden = true;
    registrationStatus.textContent = '';
  }

  if (registeredContent) {
    registeredContent.hidden = true;
  }
}


function showDisconnected() {
  currentAddress = null;

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

  if (registerButton) {
    registerButton.hidden = true;
    registerButton.disabled = false;
  }

  if (registrationStatus) {
    registrationStatus.hidden = true;
    registrationStatus.textContent = '';
  }

  if (registeredContent) {
    registeredContent.hidden = true;
  }
}


function showConnected(address) {
  const addressChanged =
    currentAddress &&
    currentAddress.toLowerCase() !==
    address.toLowerCase();

  currentAddress = address;

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

  if (addressChanged) {
    resetRegistration();
  }

  if (registerButton) {
    registerButton.hidden = false;
  }
}


// ============================================================
// CONNECT WALLET
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
// ACCOUNT STATE
// ============================================================

modal.subscribeAccount(
  (account) => {
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
  }
);


// ============================================================
// DISCONNECT WALLET
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


// ============================================================
// REQUEST SERVER NONCE
// ============================================================

async function createWalletNonce(
  walletAddress
) {
  const response =
    await fetch(
      CREATE_NONCE_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          wallet_address:
            walletAddress
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error ||
      'Could not create nonce'
    );
  }

  if (
    !data?.nonce ||
    !data?.expires_at
  ) {
    throw new Error(
      'Invalid nonce response'
    );
  }

  return data;
}


// ============================================================
// SEND SIGNATURE TO SERVER
// ============================================================

async function registerWallet(
  walletAddress,
  nonce,
  signature,
  message
) {
  const response =
    await fetch(
      REGISTER_WALLET_URL,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          wallet_address:
            walletAddress,

          nonce,

          signature,

          message
        })
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    const error =
      new Error(
        data?.message ||
        data?.error ||
        'Registration failed'
      );

    error.serverData = data;

    throw error;
  }

  return data;
}


// ============================================================
// REAL WEB3 REGISTRATION
// ============================================================

if (registerButton) {
  registerButton.addEventListener(
    'click',
    async () => {
      if (!currentAddress) {
        return;
      }

      try {
        registerButton.disabled = true;

        if (registrationStatus) {
          registrationStatus.hidden = false;

          registrationStatus.textContent =
            'Створюємо захищений запит реєстрації...';
        }


        // ----------------------------------------------------
        // 1. REQUEST NONCE FROM SUPABASE
        // ----------------------------------------------------

        const nonceData =
          await createWalletNonce(
            currentAddress
          );

        const nonce =
          nonceData.nonce;

        const expiresAt =
          nonceData.expires_at;


        // ----------------------------------------------------
        // 2. GET CONNECTED WALLET PROVIDER
        // ----------------------------------------------------

        const walletProvider =
          modal.getWalletProvider();

        if (!walletProvider) {
          throw new Error(
            'Wallet provider not available'
          );
        }

        const provider =
          new BrowserProvider(
            walletProvider
          );

        const signer =
          await provider.getSigner();

        const signerAddress =
          await signer.getAddress();


        // ----------------------------------------------------
        // 3. VERIFY CONNECTED ADDRESS
        // ----------------------------------------------------

        if (
          signerAddress.toLowerCase() !==
          currentAddress.toLowerCase()
        ) {
          throw new Error(
            'Wallet address mismatch'
          );
        }


        // ----------------------------------------------------
        // 4. MESSAGE TO SIGN
        // ----------------------------------------------------

        const message = [
          'Laki BVM — Web3 Registration',
          '',
          'Wallet: ' +
            currentAddress,
          'Network: Ethereum Mainnet',
          'Chain ID: 1',
          'Domain: bilugahaits-lab.github.io',
          'Nonce: ' +
            nonce,
          'Expires At: ' +
            expiresAt,
          '',
          'Sign this message to register your wallet.',
          'This signature does not perform a transaction',
          'and does not authorize token transfers.'
        ].join('\n');


        // ----------------------------------------------------
        // 5. SIGN MESSAGE IN METAMASK
        // ----------------------------------------------------

        if (registrationStatus) {
          registrationStatus.textContent =
            'Підтвердьте підпис у гаманці...';
        }

        const signature =
          await signer.signMessage(
            message
          );


        // ----------------------------------------------------
        // 6. SEND SIGNATURE + MESSAGE TO SERVER
        // ----------------------------------------------------

        if (registrationStatus) {
          registrationStatus.textContent =
            'Перевіряємо підпис на сервері...';
        }

        const result =
          await registerWallet(
            currentAddress,
            nonce,
            signature,
            message
          );


        // ----------------------------------------------------
        // 7. SUCCESS
        // ----------------------------------------------------

        if (result?.success !== true) {
          throw new Error(
            'Registration was not confirmed'
          );
        }

        if (registrationStatus) {
          registrationStatus.hidden = false;

          registrationStatus.textContent =
            'Web3-реєстрація успішна.';
        }

        if (registeredContent) {
          registeredContent.hidden = false;
        }

        registerButton.hidden = true;

        console.log(
          'Laki Web3 registration successful:',
          currentAddress
        );

      } catch (error) {
        console.error(
          'Registration error:',
          error
        );

        if (registrationStatus) {
          registrationStatus.hidden = false;

          if (
            error?.code === 4001 ||
            error?.code ===
              'ACTION_REJECTED'
          ) {
            registrationStatus.textContent =
              'Підпис скасовано. Реєстрацію не виконано.';

          } else if (
            error?.serverData?.error ===
              'WALLET_ALREADY_REGISTERED' ||
            error?.serverData?.error ===
              'ALREADY_REGISTERED' ||
            String(
              error?.message || ''
            )
              .toLowerCase()
              .includes(
                'already registered'
              )
          ) {
            registrationStatus.textContent =
              'Цей гаманець уже зареєстрований.';

          } else {
            registrationStatus.textContent =
              'Не вдалося виконати Web3-реєстрацію.';
          }
        }

        registerButton.disabled = false;
      }
    }
  );
}


export {
  modal
};
