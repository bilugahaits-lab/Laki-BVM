import { createAppKit } from '@reown/appkit';
import { mainnet } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { BrowserProvider } from 'ethers';


// ============================================================
// REOWN
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
// SUPABASE
// ============================================================

const SUPABASE_FUNCTIONS_URL =
  'https://xbgjgzijlykgsjfsasoz.supabase.co/functions/v1';

const CREATE_NONCE_URL =
  `${SUPABASE_FUNCTIONS_URL}/create-wallet-nonce`;

const REGISTER_WALLET_URL =
  `${SUPABASE_FUNCTIONS_URL}/register-wallet`;

const CHECK_REGISTRATION_URL =
  `${SUPABASE_FUNCTIONS_URL}/check-wallet-registration`;

const PROTECTED_ASSETS_URL =
  `${SUPABASE_FUNCTIONS_URL}/get-registered-assets`;


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

const registeredDownloads =
  document.getElementById(
    'registeredDownloads'
  );

const requestDownloadsButton =
  document.getElementById(
    'requestProtectedDownloads'
  );

const downloadStatus =
  document.getElementById(
    'downloadStatus'
  );

const protectedDownloadLinks =
  document.getElementById(
    'protectedDownloadLinks'
  );

const downloadBvmButton =
  document.getElementById(
    'downloadBvmButton'
  );

const downloadUnoButton =
  document.getElementById(
    'downloadUnoButton'
  );


// ============================================================
// STATE
// ============================================================

let currentAddress = null;

let accountStateVersion = 0;


// ============================================================
// HELPERS
// ============================================================

function shortAddress(
  address
) {

  if (!address) {
    return '';
  }

  return (
    address.slice(0, 6) +
    '...' +
    address.slice(-4)
  );
}


function clearProtectedDownloads() {

  if (downloadBvmButton) {

    downloadBvmButton.removeAttribute(
      'href'
    );
  }


  if (downloadUnoButton) {

    downloadUnoButton.removeAttribute(
      'href'
    );
  }


  if (protectedDownloadLinks) {

    protectedDownloadLinks.hidden =
      true;
  }


  if (downloadStatus) {

    downloadStatus.hidden =
      true;

    downloadStatus.textContent =
      '';
  }


  if (requestDownloadsButton) {

    requestDownloadsButton.hidden =
      false;

    requestDownloadsButton.disabled =
      false;
  }
}


function setRegisteredAccess(
  isRegistered
) {

  if (registeredContent) {

    registeredContent.hidden =
      !isRegistered;
  }


  if (registeredDownloads) {

    registeredDownloads.hidden =
      !isRegistered;
  }


  if (registerButton) {

    registerButton.hidden =
      isRegistered;

    registerButton.disabled =
      false;
  }


  if (!isRegistered) {

    clearProtectedDownloads();
  }
}


function resetRegistration() {

  setRegisteredAccess(
    false
  );


  if (registrationStatus) {

    registrationStatus.hidden =
      true;

    registrationStatus.textContent =
      '';
  }
}


function showDisconnected() {

  accountStateVersion += 1;

  currentAddress =
    null;


  if (connectButton) {

    connectButton.hidden =
      false;
  }


  if (disconnectButton) {

    disconnectButton.hidden =
      true;
  }


  if (walletStatus) {

    walletStatus.hidden =
      true;

    walletStatus.textContent =
      '';
  }


  resetRegistration();


  if (registerButton) {

    registerButton.hidden =
      true;
  }


  clearProtectedDownloads();
}


function showConnected(
  address
) {

  currentAddress =
    address;


  if (connectButton) {

    connectButton.hidden =
      true;
  }


  if (disconnectButton) {

    disconnectButton.hidden =
      false;
  }


  if (walletStatus) {

    walletStatus.hidden =
      false;

    walletStatus.textContent =
      'Підключено: ' +
      shortAddress(address) +
      ' · Ethereum Mainnet';
  }
}


// ============================================================
// POST JSON
// ============================================================

async function postJson(
  url,
  body
) {

  const response =
    await fetch(
      url,
      {

        method:
          'POST',

        headers: {

          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(
            body
          )
      }
    );


  let data = {};


  try {

    data =
      await response.json();

  } catch {

    data = {};
  }


  if (!response.ok) {

    const error =
      new Error(
        data?.error ||
        `HTTP ${response.status}`
      );


    error.serverData =
      data;


    throw error;
  }


  return data;
}


// ============================================================
// CHECK REGISTRATION
// ============================================================

async function checkWalletRegistration(
  walletAddress
) {

  return postJson(
    CHECK_REGISTRATION_URL,
    {
      wallet_address:
        walletAddress
    }
  );
}


async function refreshRegistrationState(
  walletAddress,
  stateVersion
) {

  try {

    if (registrationStatus) {

      registrationStatus.hidden =
        false;

      registrationStatus.textContent =
        'Перевіряємо реєстрацію гаманця...';
    }


    const data =
      await checkWalletRegistration(
        walletAddress
      );


    if (
      stateVersion !==
        accountStateVersion ||
      !currentAddress ||
      currentAddress.toLowerCase() !==
        walletAddress.toLowerCase()
    ) {

      return;
    }


    const isRegistered =
      data?.registered === true ||
      data?.is_registered === true ||
      data?.registration_verified === true;


    if (isRegistered) {

      setRegisteredAccess(
        true
      );


      if (registrationStatus) {

        registrationStatus.hidden =
          false;

        registrationStatus.textContent =
          'Гаманець зареєстрований. Доступ підтверджено.';
      }

    } else {

      setRegisteredAccess(
        false
      );


      if (registrationStatus) {

        registrationStatus.hidden =
          true;

        registrationStatus.textContent =
          '';
      }
    }

  } catch (error) {

    console.error(
      'Registration check error:',
      error
    );


    if (
      stateVersion !==
      accountStateVersion
    ) {

      return;
    }


    setRegisteredAccess(
      false
    );


    if (registrationStatus) {

      registrationStatus.hidden =
        false;

      registrationStatus.textContent =
        'Не вдалося перевірити реєстрацію гаманця.';
    }
  }
}


// ============================================================
// CONNECT
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

      accountStateVersion += 1;


      const stateVersion =
        accountStateVersion;


      clearProtectedDownloads();


      showConnected(
        account.address
      );


      refreshRegistrationState(
        account.address,
        stateVersion
      );

    } else {

      showDisconnected();
    }
  }
);


// ============================================================
// DISCONNECT
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
// CREATE REGISTRATION NONCE
// ============================================================

async function createWalletNonce(
  walletAddress
) {

  const data =
    await postJson(
      CREATE_NONCE_URL,
      {
        wallet_address:
          walletAddress
      }
    );


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
// REGISTER WALLET
// ============================================================

async function registerWallet(
  walletAddress,
  nonce,
  message,
  signature
) {

  return postJson(
    REGISTER_WALLET_URL,
    {

      wallet_address:
        walletAddress,

      nonce,

      message,

      signature
    }
  );
}


// ============================================================
// REGISTRATION BUTTON
// ============================================================

if (registerButton) {

  registerButton.addEventListener(
    'click',

    async () => {

      if (!currentAddress) {

        return;
      }


      try {

        registerButton.disabled =
          true;


        if (registrationStatus) {

          registrationStatus.hidden =
            false;

          registrationStatus.textContent =
            'Створюємо захищений запит реєстрації...';
        }


        const nonceData =
          await createWalletNonce(
            currentAddress
          );


        const nonce =
          nonceData.nonce;


        const expiresAt =
          nonceData.expires_at;


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


        if (
          signerAddress.toLowerCase() !==
          currentAddress.toLowerCase()
        ) {

          throw new Error(
            'Wallet address mismatch'
          );
        }


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


        if (registrationStatus) {

          registrationStatus.textContent =
            'Підтвердьте підпис у гаманці...';
        }


        const signature =
          await signer.signMessage(
            message
          );


        if (registrationStatus) {

          registrationStatus.textContent =
            'Перевіряємо підпис на сервері...';
        }


        const result =
          await registerWallet(
            currentAddress,
            nonce,
            message,
            signature
          );


        if (
          result?.success !==
          true
        ) {

          throw new Error(
            'Registration was not confirmed'
          );
        }


        setRegisteredAccess(
          true
        );


        if (registrationStatus) {

          registrationStatus.hidden =
            false;

          registrationStatus.textContent =
            'Web3-реєстрація успішна. Доступ підтверджено.';
        }


      } catch (error) {

        console.error(
          'Registration error:',
          error
        );


        if (registrationStatus) {

          registrationStatus.hidden =
            false;


          if (
            error?.code ===
              4001 ||
            error?.code ===
              'ACTION_REJECTED'
          ) {

            registrationStatus.textContent =
              'Підпис скасовано. Реєстрацію не виконано.';


          } else if (

            error?.serverData?.code ===
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


            await refreshRegistrationState(
              currentAddress,
              accountStateVersion
            );


          } else {

            registrationStatus.textContent =
              'Не вдалося виконати Web3-реєстрацію.';
          }
        }


        registerButton.disabled =
          false;
      }
    }
  );
}


// ============================================================
// PROTECTED DOWNLOAD ACCESS
// ============================================================

if (requestDownloadsButton) {

  requestDownloadsButton.addEventListener(
    'click',

    async () => {

      if (!currentAddress) {

        return;
      }


      try {

        requestDownloadsButton.disabled =
          true;


        if (downloadStatus) {

          downloadStatus.hidden =
            false;

          downloadStatus.textContent =
            'Підтвердьте доступ у гаманці...';
        }


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


        if (
          signerAddress.toLowerCase() !==
          currentAddress.toLowerCase()
        ) {

          throw new Error(
            'Wallet address mismatch'
          );
        }


        const timestamp =
          Date.now();


        const message = [

          'Laki BVM — Protected Asset Access',

          '',

          'Wallet: ' +
            currentAddress,

          'Network: Ethereum Mainnet',

          'Chain ID: 1',

          'Domain: bilugahaits-lab.github.io',

          'Timestamp: ' +
            timestamp,

          '',

          'Sign this message to access protected Laki assets.',

          'This signature does not perform a transaction',

          'and does not authorize token transfers.'

        ].join('\n');


        const signature =
          await signer.signMessage(
            message
          );


        if (downloadStatus) {

          downloadStatus.textContent =
            'Створюємо захищені посилання...';
        }


        const result =
          await postJson(
            PROTECTED_ASSETS_URL,
            {

              wallet_address:
                currentAddress,

              message,

              signature
            }
          );


        if (
          result?.success !== true ||
          !result?.assets?.bvm?.url ||
          !result?.assets?.uno?.url
        ) {

          throw new Error(
            'Protected links were not created'
          );
        }


        if (downloadBvmButton) {

          downloadBvmButton.href =
            result.assets.bvm.url;
        }


        if (downloadUnoButton) {

          downloadUnoButton.href =
            result.assets.uno.url;
        }


        if (protectedDownloadLinks) {

          protectedDownloadLinks.hidden =
            false;
        }


        requestDownloadsButton.hidden =
          true;


        if (downloadStatus) {

          downloadStatus.hidden =
            false;

          downloadStatus.textContent =
            'Захищений доступ відкрито на 5 хвилин.';
        }


        window.setTimeout(
          () => {

            clearProtectedDownloads();


            if (
              currentAddress &&
              downloadStatus
            ) {

              downloadStatus.hidden =
                false;

              downloadStatus.textContent =
                'Час захищеного доступу завершився. За потреби отримайте нове посилання.';
            }

          },

          300000
        );


      } catch (error) {

        console.error(
          'Protected download error:',
          error
        );


        if (downloadStatus) {

          downloadStatus.hidden =
            false;


          if (
            error?.code ===
              4001 ||
            error?.code ===
              'ACTION_REJECTED'
          ) {

            downloadStatus.textContent =
              'Підпис скасовано. Доступ не відкрито.';

          } else {

            downloadStatus.textContent =
              'Не вдалося отримати захищений доступ.';
          }
        }


        requestDownloadsButton.disabled =
          false;
      }
    }
  );
}


// ============================================================
// EXPORT
// ============================================================

export {
  modal
};
