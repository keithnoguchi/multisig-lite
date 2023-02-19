import { PublicKey } from '@solana/web3.js';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

type Wallet = {
	publicKey: PublicKey;
};

export const wallet: Writable<Wallet> = writable({
	publicKey: undefined
});
