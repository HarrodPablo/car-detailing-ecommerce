import { create } from 'zustand';

const useAlertStore = create((set) => ({
  stockAlerts: [],
  lotAlerts: [],
  setStockAlerts: (alerts) => set({ stockAlerts: alerts }),
  setLotAlerts: (alerts) => set({ lotAlerts: alerts })
}));

export default useAlertStore;
