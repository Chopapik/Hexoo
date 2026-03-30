import { useAppStore, type RootState, type AppDispatch } from "./store";

export const useAppDispatch = (): AppDispatch =>
  useAppStore((state) => state.dispatch);

export const useAppSelector = <T>(
  selector: (state: RootState) => T,
): T => useAppStore(selector);
