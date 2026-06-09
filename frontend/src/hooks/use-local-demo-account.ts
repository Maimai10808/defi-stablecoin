"use client";

import { useEffect, useMemo, useState } from "react";
import type { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

import { LOCAL_DEMO_ACCOUNTS } from "@/constants/local-demo-accounts";

export function useLocalDemoAccounts() {
  const chainId = useChainId();
  const isLocalDemo = chainId === 31337;

  return {
    accounts: LOCAL_DEMO_ACCOUNTS,
    isLocalDemo,
  };
}

export function useSelectedLocalDemoAccount() {
  const { address } = useAccount();
  const { accounts, isLocalDemo } = useLocalDemoAccounts();

  const [selectedAddress, setSelectedAddress] = useState<Address>(
    LOCAL_DEMO_ACCOUNTS[0].address
  );

  useEffect(() => {
    if (!isLocalDemo || !address) {
      return;
    }

    const matchingAccount = LOCAL_DEMO_ACCOUNTS.find(
      (account) => account.address.toLowerCase() === address.toLowerCase()
    );

    if (!matchingAccount) return;

    let cancelled = false;

    const syncSelectedAccount = async () => {
      await Promise.resolve();
      if (cancelled) return;

      setSelectedAddress((current) =>
        current.toLowerCase() === matchingAccount.address.toLowerCase()
          ? current
          : matchingAccount.address
      );
    };

    void syncSelectedAccount();

    return () => {
      cancelled = true;
    };
  }, [address, isLocalDemo]);

  const selectedAccount = useMemo(
    () =>
      accounts.find(
        (account) => account.address.toLowerCase() === selectedAddress.toLowerCase()
      ) ?? accounts[0],
    [accounts, selectedAddress]
  );

  return {
    accounts,
    displayAddress: isLocalDemo ? selectedAccount.address : undefined,
    isLocalDemo,
    selectedAccount,
    selectedAddress,
    setSelectedAddress,
  };
}

export function useLocalDemoAccount() {
  return useSelectedLocalDemoAccount();
}
