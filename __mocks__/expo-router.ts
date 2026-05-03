export const useRouter = () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() });
export const useLocalSearchParams = () => ({});
export const useFocusEffect = (cb: () => void) => { cb(); };
export const Link = "Link";
export const Stack = { Screen: "Screen" };
export const Tabs = { Screen: "Screen" };
