import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Account } from "@/types";

interface CurrentAccountState {
  currentAccountId: string | null;
  setCurrentAccountId: (accountId: string | null) => void;
}

// Zustand store for current account selection
export const useCurrentAccountStore = create<CurrentAccountState>()(
  persist(
    (set) => ({
      currentAccountId: null,
      setCurrentAccountId: (accountId) => set({ currentAccountId: accountId }),
    }),
    {
      name: "current-account-storage",
    }
  )
);

// Hook to get current account with data
export function useCurrentAccount(accounts: Account[] = []) {
  const { currentAccountId, setCurrentAccountId } = useCurrentAccountStore();
  
  // Find the current account from the accounts list
  const currentAccount = accounts.find(account => account.id === currentAccountId);
  
  // If no current account is set or the account doesn't exist, set the first account
  if (accounts.length > 0 && (!currentAccountId || !currentAccount)) {
    const firstAccount = accounts[0];
    setCurrentAccountId(firstAccount.id);
    return firstAccount;
  }
  
  return currentAccount || null;
}

// Hook for switching accounts
export function useAccountSwitcher() {
  const { setCurrentAccountId } = useCurrentAccountStore();
  
  const switchAccount = (accountId: string) => {
    setCurrentAccountId(accountId);
  };
  
  return { switchAccount };
}