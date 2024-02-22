/* @license Copyright 2024 @polkadot-cloud/library authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { ExtensionConfig } from "./types";

export const Extensions: Record<string, ExtensionConfig> = {
  enkrypt: {
    title: "Enkrypt",
    website: "enkrypt.com",
    category: "web-extension",
    features: "*",
  },
  "fearless-wallet": {
    title: "Fearless Wallet",
    website: "fearlesswallet.io",
    category: "web-extension",
    features: "*",
  },
  "metamask-polkadot-snap": {
    title: "MetaMask Polkadot Snap",
    website: {
      url: "snaps.metamask.io/snap/npm/chainsafe/polkadot-snap",
      text: "snaps.metamask.io",
    },
    category: "web-extension",
    features: ["getAccounts", "signer"],
  },
  polkagate: {
    title: "PolkaGate",
    website: "polkagate.xyz",
    category: "web-extension",
    features: "*",
  },
  "subwallet-js": {
    title: "SubWallet",
    website: "subwallet.app",
    category: "web-extension",
    features: "*",
  },
  talisman: {
    title: "Talisman",
    website: "talisman.xyz",
    category: "web-extension",
    features: "*",
  },
  // TODO: amend dashboard side to test if `window?.walletExtension?.isNovaWallet` is present, and
  // use `nova-wallet` instead.
  "polkadot-js": {
    title: "Polkadot JS",
    website: "polkadot.js.org/extension",
    category: "web-extension",
    features: "*",
  },
  "nova-wallet": {
    title: "Nova Wallet",
    website: "novawallet.io",
    category: "web-extension",
    features: "*",
  },
  ledger: {
    title: "Ledger",
    website: "ledger.com",
    category: "hardware",
    features: [],
  },
  polkadotvault: {
    title: "Polkadot Vault",
    website: "signer.parity.io/",
    category: "hardware",
    features: [],
  },
  walletconnect: {
    title: "WalletConnect",
    website: "walletconnect.com",
    category: "hardware",
    features: [],
  },
};

// TODO: Code from here should be generated by build process.

// Format lists as arrays.
// ----------------------------------

// export const ExtensionsArray = Object.entries(Extensions).map(
//   ([key, value]) => ({
//     id: key,
//     ...value,
//   })
// );

// export const HardwareArray = Object.entries(Hardware).map(([key, value]) => ({
//   id: key,
//   ...value,
// }));

// export const ExtensionIcons: ExtensionIconRecords = {
//   enkrypt: Enkrypt,
//   "fearless-wallet": FearlessWallet,
//   "metamask-polkadot-snap": MetaMask,
//   novawallet: NovaWallet,
//   "polkadot-js": PolkadotJS,
//   polkagate: PolkaGate,
//   "subwallet-js": SubwalletJS,
//   talisman: Talisman,
// };

// export const HardwareIcons: ExtensionIconRecords = {
//   ledger: Ledger,
//   polkadotvault: PolkadotVault,
//   walletconnect: WalletConnect,
// };
