import create, { State } from "zustand";

interface LinkState extends State {
    radius: number;
    continentCenterX: number;
    continentCenterY: number;
    continentCenterZ: number;
    depthFactor: number;

    setRadius: (rad: number) => void;
    setcCenterX: (cX: number) => void;
    setcCenterY: (cY: number) => void;
    setcCenterZ: (cZ: number) => void;
}

const useStore = create<LinkState>((set, get) => ({
    radius: 24,
    continentCenterX: 0,
    continentCenterY: 0,
    continentCenterZ: 0,
    depthFactor: 6.35,

    setRadius: (rad) => set((state) => ({ radius: rad })),
    setcCenterX: (cX) => set((state) => ({ continentCenterX: cX })),
    setcCenterY: (cY) => set((state) => ({ continentCenterY: cY })),
    setcCenterZ: (cZ) => set((state) => ({ continentCenterZ: cZ })),
}));

export default useStore;
