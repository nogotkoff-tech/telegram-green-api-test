import type { Credentials } from "@gata/shared";
import { createStore } from "zustand";

type TAppInstanceStoreData = Credentials & {
	setIdInstance: (idInstance: Credentials["idInstance"]) => void;
};

export const appInstanceStore = createStore<TAppInstanceStoreData>((set) => ({
	idInstance: "",
	apiTokenInstance: "",
	setIdInstance: (idInstance) => set(() => ({ idInstance })),
}));
