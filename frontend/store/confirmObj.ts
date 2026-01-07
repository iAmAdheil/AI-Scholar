import { create } from "zustand";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";

interface Confirm {
  confirmObj: FirebaseAuthTypes.ConfirmationResult | null | undefined;
  updateConfirmObj: (
    confirmObj: FirebaseAuthTypes.ConfirmationResult | null | undefined,
  ) => void;
  resetConfirmObj: () => void;
}

export const useConfirmObj = create<Confirm>((set) => ({
  confirmObj: null as FirebaseAuthTypes.ConfirmationResult | null | undefined,
  updateConfirmObj: (
    confirmObj: FirebaseAuthTypes.ConfirmationResult | null | undefined,
  ) => set({ confirmObj }),
  resetConfirmObj: () => set({ confirmObj: null }),
}));
