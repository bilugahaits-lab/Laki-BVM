import { createAppKit } from '@reown/appkit';
import { mainnet } from '@reown/appkit/networks';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import {
  BrowserProvider,
  verifyMessage
} from 'ethers';


// ============================================================
// REOWN PROJECT
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
// ELEMENTS
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
// SHORT ADDRESS
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
// REGISTRATION RESET
// ============================================================

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


// ============================================================
// DISCONNECTED STATE
// ============================================================

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


// ============================================================
// CONNECTED STATE
// ============================================================

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
// ACCOUNT LISTENER
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
// TEST REGISTRATION
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
            'Підтвердьте тестовий підпис у гаманці...';

        }


        // ----------------------------------------------------
        // GET ACTIVE WALLET PROVIDER
        // ----------------------------------------------------

        const walletProvider =
          modal.getWalletProvider();


        if (!walletProvider) {

          throw new Error(
            'Wallet provider not available'
          );

        }


        // ----------------------------------------------------
        // ETHERS PROVIDER
        // ----------------------------------------------------

        const provider =
          new BrowserProvider(
            walletProvider
          );


        const signer =
          await provider.getSigner();


        const signerAddress =
          await signer.getAddress();


        // ----------------------------------------------------
        // CHECK ACTIVE ADDRESS
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
        // TEST REGISTRATION MESSAGE
        // ----------------------------------------------------

        const message = [

          'Laki BVM — тестова Web3-реєстрація',

          '',

          'Адреса: ' +
            currentAddress,

          'Мережа: Ethereum Mainnet',

          'Домен: bilugahaits-lab.github.io',

          'Час: ' +
            new Date().toISOString(),

          '',

          'Це тестовий підпис.',

          'Він не виконує транзакцію та не надає дозволу на використання токенів.'

        ].join('\n');


        // ----------------------------------------------------
        // SIGN MESSAGE
        // ----------------------------------------------------

        const signature =
          await signer.signMessage(
            message
          );


        // ----------------------------------------------------
        // VERIFY SIGNATURE LOCALLY
        // ----------------------------------------------------

        const recoveredAddress =
          verifyMessage(
            message,
            signature
          );


        if (
          recoveredAddress.toLowerCase() !==
          currentAddress.toLowerCase()
        ) {

          throw new Error(
            'Signature verification failed'
          );

        }


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        if (registrationStatus) {

          registrationStatus.hidden = false;

          registrationStatus.textContent =
            'Тестова реєстрація успішна.';

        }


        if (registeredContent) {

          registeredContent.hidden = false;

        }


        registerButton.hidden = true;


        console.log(
          'Laki test registration successful:',
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
            error?.code === 'ACTION_REJECTED'
          ) {

            registrationStatus.textContent =
              'Підпис скасовано. Реєстрацію не виконано.';

          } else {

            registrationStatus.textContent =
              'Не вдалося виконати тестову реєстрацію.';

          }

        }


        registerButton.disabled = false;

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
