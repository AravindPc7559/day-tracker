import { create } from 'zustand';
import Purchases, { type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import { fetchSubscriptionStatus } from './subscription.api';
import { PREMIUM_ENTITLEMENT_ID } from './subscription.types';

interface SubscriptionState {
  isActive: boolean;
  isLoading: boolean;
  offering: PurchasesOffering | null;
  refresh: () => Promise<void>;
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isActive: false,
  isLoading: true,
  offering: null,

  refresh: async () => {
    let isRevenueCatActive = false;
    let offering: PurchasesOffering | null = null;

    try {
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);
      isRevenueCatActive = typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== 'undefined';
      offering = offerings.current;
    } catch {
      // RevenueCat unavailable (not configured, offline) — fall back to server status below
    }

    // Server status lets us grant access without a real purchase (e.g. test accounts)
    let isServerActive = false;
    try {
      const status = await fetchSubscriptionStatus();
      isServerActive = status.subscriptionStatus === 'active';
    } catch {
      // ignore — server check is a fallback, not required
    }

    set({ isActive: isRevenueCatActive || isServerActive, offering, isLoading: false });
  },

  purchase: async (pkg: PurchasesPackage) => {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    set({
      isActive: typeof customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== 'undefined',
    });
  },

  reset: () => set({ isActive: false, isLoading: true, offering: null }),
}));
