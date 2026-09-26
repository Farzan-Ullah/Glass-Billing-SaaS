import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  mobileSidebarOpen: false,

  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),

  setMobileSidebarOpen: (open) =>
    set({
      mobileSidebarOpen: open,
    }),
}));