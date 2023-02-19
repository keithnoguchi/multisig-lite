import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type Wallet = {
	publicKey: string;
};

export const wallet: Writable<Wallet> = writable({
	publicKey: undefined
});
