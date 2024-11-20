/* @license Copyright 2024 w3ux authors & contributors
SPDX-License-Identifier: GPL-3.0-only */

import { setStateWithRef, withTimeout } from "@w3ux/utils";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import type { ExtensionStatus, ExtensionsContextInterface } from "./types";
import { defaultExtensionsContext } from "./defaults";
import extensions from "@w3ux/extension-assets";
import { web3Enable } from "@polkagate/extension-dapp";

export const ExtensionsContext = createContext<ExtensionsContextInterface>(
  defaultExtensionsContext
);

export const useExtensions = () => useContext(ExtensionsContext);

export const ExtensionsProvider = ({
  children,
  options,
}: {
  children: ReactNode;
  options?: {
    chainSafeSnapEnabled?: boolean;
    polkagateSnapEnabled?: boolean;
  };
}) => {
  // Store whether initial `injectedWeb3` checking is underway.
  //
  // Injecting `injectedWeb3` is an asynchronous process, so we need to check for its existence for
  // a period of time.
  const [checkingInjectedWeb3, setCheckingInjectedWeb3] =
    useState<boolean>(true);
  const checkingInjectedWeb3Ref = useRef(checkingInjectedWeb3);

  // Store whether injected interval has been initialised.
  const intervalInitialisedRef = useRef<boolean>(false);

  // Store each extension's status in state.
  const [extensionsStatus, setExtensionsStatus] = useState<
    Record<string, ExtensionStatus>
  >({});
  const extensionsStatusRef = useRef(extensionsStatus);

  // Store whether Metamask Snaps are enabled.
  const [polkaGateSnapEnabled] = useState<boolean>(
    options?.polkagateSnapEnabled || false
  );

  // Listen for window.injectedWeb3 with an interval.
  let injectedWeb3Interval: ReturnType<typeof setInterval>;
  const injectCounter = useRef<number>(0);

  // Handle completed interval check for `injectedWeb3`.
  //
  // Clear interval and move on to checking for Metamask Polkadot Snap.
  const handleClearInterval = () => {
    clearInterval(injectedWeb3Interval);
    // Check if Metamask Polkadot Snap is available.
    handleSnapInjection();
  };

  // Handle injecting of `metamask-polkadot-snap` into injectedWeb3 if avaialble, and complete
  // `injectedWeb3` syncing process.
  const handleSnapInjection = async () => {
    // Inject PolkaGate Snap if enabled.
    if (polkaGateSnapEnabled) {
      await withTimeout(500, web3Enable("snap_only"));
    }

    setStateWithRef(false, setCheckingInjectedWeb3, checkingInjectedWeb3Ref);
  };

  // Setter for an extension status.
  const setExtensionStatus = (id: string, status: ExtensionStatus) => {
    setStateWithRef(
      {
        ...extensionsStatusRef.current,
        [id]: status,
      },
      setExtensionsStatus,
      extensionsStatusRef
    );
  };

  // Removes an extension from the `extensionsStatus` state.
  const removeExtensionStatus = (id: string) => {
    const newExtensionsStatus = { ...extensionsStatusRef.current };
    delete newExtensionsStatus[id];

    setStateWithRef(
      newExtensionsStatus,
      setExtensionsStatus,
      extensionsStatusRef
    );
  };

  // Checks if an extension has been installed.
  const extensionInstalled = (id: string): boolean =>
    extensionsStatus[id] !== undefined;

  // Checks whether an extension can be connected to.
  const extensionCanConnect = (id: string): boolean =>
    extensionInstalled(id) && extensionsStatus[id] !== "connected";

  // Checks whether an extension supports a feature.
  const extensionHasFeature = (id: string, feature: string): boolean => {
    const { features } = extensions[id];
    if (features === "*" || features.includes(feature)) {
      return true;
    } else {
      return false;
    }
  };

  // Check for `injectedWeb3` and Metamask Snap on mount. To trigger interval on soft page
  // refreshes, no empty dependency array is provided to this `useEffect`. Checks for `injectedWeb3`
  // for a total of 3 seconds before giving up.
  //
  // Interval duration.
  const checkEveryMs = 300;
  // Total interval iterations.
  const totalChecks = 10;
  useEffect(() => {
    if (!intervalInitialisedRef.current) {
      intervalInitialisedRef.current = true;

      injectedWeb3Interval = setInterval(() => {
        injectCounter.current++;
        if (injectCounter.current === totalChecks) {
          handleClearInterval();
        }
      }, checkEveryMs);
    }

    return () => clearInterval(injectedWeb3Interval);
  });

  return (
    <ExtensionsContext.Provider
      value={{
        extensionsStatus: extensionsStatusRef.current,
        checkingInjectedWeb3,
        setExtensionStatus,
        removeExtensionStatus,
        extensionInstalled,
        extensionCanConnect,
        extensionHasFeature,
      }}
    >
      {children}
    </ExtensionsContext.Provider>
  );
};
