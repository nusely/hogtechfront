import { create } from 'zustand';

interface MegaMenuState {
  activeMenu: string | null;
  isOpen: boolean;
  setActiveMenu: (menu: string | null) => void;
  closeMenu: () => void;
}

export const useMegaMenuStore = create<MegaMenuState>((set) => ({
  activeMenu: null,
  isOpen: false,
  setActiveMenu: (menu) => set({ activeMenu: menu, isOpen: menu !== null }),
  closeMenu: () => set({ activeMenu: null, isOpen: false }),
}));



